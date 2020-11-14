import { APIGatewayProxyEvent } from 'aws-lambda';

import * as productCtrl from '../controllers/product.ctrl';
import { lambdaHandler } from '../utils/handler.utils';

export const getProducts = lambdaHandler((_event: APIGatewayProxyEvent) => {
  return productCtrl.getProducts();
});
