import { ProductDT } from './product.dt';
import { HttpCode, HttpError } from '../utils/http.utils';
import { ProductDB } from '../services/product.db';
import * as productService from '../services/product.service';
import { UUID_REGEX } from '../utils/utils';

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
  const { count } = product;
  const mappedProduct = mapToProductDB(product);

  return productService.createProduct(mappedProduct, count);
}