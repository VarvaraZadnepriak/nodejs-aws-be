import { APIGatewayProxyEvent } from 'aws-lambda';

import { lambdaHandler } from '../utils/handler.utils';
import * as productCtrl from '../controllers/product.ctrl';

export const getProduct = lambdaHandler((event: APIGatewayProxyEvent) => {
  const { productId } = event.pathParameters;

  return productCtrl.getProduct(productId);
});
