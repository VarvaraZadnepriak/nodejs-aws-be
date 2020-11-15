import { APIGatewayProxyEvent, S3Event } from 'aws-lambda';
import 'source-map-support/register';
import {
  lambdaApiGatewayHandler,
  lambdaS3Handler,
 } from './utils/handler.utils';
import * as importCtrl from './controllers/import.ctrl';
import { HttpCode, HttpError } from './utils/http.utils';

export const INCORRECT_FILENAME_MESSAGE = 'File name should be *.csv'; 

export const importProductsFile = lambdaApiGatewayHandler((event: APIGatewayProxyEvent) => {
  const { name } = event.queryStringParameters;

  if (!name || !name.endsWith('.csv')) {
    throw new HttpError(HttpCode.BAD_REQUEST, INCORRECT_FILENAME_MESSAGE);
  }

  return importCtrl.importProductsFile(name);
});

export const parseProductsFiles = lambdaS3Handler(async (event: S3Event) => {
  for (const record of event.Records) {
    await importCtrl.parseProductsFile(record.s3.object.key);
  }
});
