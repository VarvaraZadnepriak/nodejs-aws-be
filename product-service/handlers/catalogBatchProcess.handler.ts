import { SQSEvent } from 'aws-lambda';
import { lambdaSQSHandler } from '../utils/handler.utils';

import * as productCtrl from '../controllers/product.ctrl';
import { ProductDT } from '../controllers/product.dt';

export const catalogBatchProcess = lambdaSQSHandler(async (event: SQSEvent) => {
  const products: ProductDT[] = event.Records.map(record => JSON.parse(record.body));

  await productCtrl.createBatchProduct(products, event.Records);
});
