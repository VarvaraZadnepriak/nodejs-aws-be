import { ProductDT } from './product.dt';
import { HttpCode, HttpError } from '../utils/http.utils';
import { ProductDB } from '../services/product.db';
import * as productService from '../services/product.service';
import { UUID_REGEX } from '../utils/validation.utils';
import loggerUtils from '../utils/logger.utils';
import * as sns from '../services/sns';
import config from '../config';
import { SQSRecord } from 'aws-lambda';
import * as sqs from '../services/sqs'; 

/* Mappers */

function mapToProductDB(product: ProductDT): ProductDB {
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    image_url: product.imageUrl,
  };
}

function mapToProductDT(product: ProductDB): ProductDT {
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    imageUrl: product.image_url,
    count: product.count,
  };
}

/* BL logic */

export async function getProducts(): Promise<ProductDT[]> {
  const products = await productService.getProducts();

  return products.map(mapToProductDT);
}

export async function getProduct(productId: string): Promise<ProductDT> {
  if (!productId || !UUID_REGEX.test(productId)) {
    throw new HttpError(
      HttpCode.BAD_REQUEST,
      'Invalid productId uuid'
    );
  }
  
  const product = await productService.getProduct(productId);

  if (!product) {
    throw new HttpError(
      HttpCode.NOT_FOUND,
      `Product with id: ${productId} was not found`
    );
  }

  return mapToProductDT(product);
}

export async function createProduct(product: ProductDT): Promise<string> {
  loggerUtils.log('createProduct', product);
  const { count } = product;
  const mappedProduct = mapToProductDB(product);

  return productService.createProduct(mappedProduct, count);
}

export async function createBatchProduct(products: ProductDT[], records: SQSRecord[]): Promise<void> {  
  const results = await Promise.allSettled(products.map((product) => createProduct(product)));

  for (let index = 0; index < results.length; index++) {
    const result = results[index];
    const isSuccess = result.status === 'fulfilled';
    const product = products[index];
    
    if (isSuccess) {
      await sqs.deleteMessage(records[index])
        .catch(() => loggerUtils.error('deleteMessage'));
    }

    await sns.publishSNSMessage({
      Subject: isSuccess ? 'New product added' : 'New product FAIL',
      Message: JSON.stringify(products[index]),
      TopicArn: config.SNS_TOPIC_ARN,
      MessageAttributes: {
        price: {
          DataType: 'Number',
          StringValue: `${product.price}`
        }
      }
    }).catch(() => loggerUtils.error('publishSNSMessage'));
  }
}