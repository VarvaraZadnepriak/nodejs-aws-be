import { APIGatewayProxyEvent } from 'aws-lambda';

import { lambdaHandler } from '../utils/handler.utils';
import * as productCtrl from '../controllers/product.ctrl';


export const createProduct = lambdaHandler((event: APIGatewayProxyEvent) => {
  const product = JSON.parse(event.body);

  return productCtrl.createProduct(product);
});
