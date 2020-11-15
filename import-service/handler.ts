import { APIGatewayProxyEvent, S3Event } from 'aws-lambda';
import 'source-map-support/register';
import {
  lambdaApiGatewayHandler,
  lambdaS3Handler,
 } from './utils/handler.utils';
import * as importCtrl from './controllers/import.ctrl';

export const importProductsFile = lambdaApiGatewayHandler((event: APIGatewayProxyEvent) => {
  const { name } = event.queryStringParameters || {};

  return importCtrl.importProductsFile(name);
});

export const parseProductsFiles = lambdaS3Handler(async (event: S3Event) => {
  for (const record of event.Records) {
    await importCtrl.parseProductsFile(record.s3.object.key);
  }
});
