import { pipeline } from 'stream';
import * as csv from 'csv-parser';

import config from '../config';
import * as s3 from '../services/s3';
import logger from '../utils/logger.utils';

export async function importProductsFile(fileName: string): Promise<string> {
  const signedUrl = await s3.getSignedUrlPromise('putObject', {
    Bucket: config.PRODUCT_CATALOGUE_S3_BUCKET,
    Key: `${config.UPLOADED_PATH}/${fileName}`,
    Expires: 60,
    ContentType: 'text/csv',
  });

  return signedUrl;
}

export async function parseProductsFile(fileName: string): Promise<void> {
  logger.log('parseProductsFile', fileName);

  const s3ReadStream = s3.createObjectReadStream({
    Bucket: config.PRODUCT_CATALOGUE_S3_BUCKET,
    Key: fileName,
  });

  const csvStream = csv().on('data', (product) => {
    logger.log('CSV Line', product);
  });

  await new Promise((resolve, reject) => {
    pipeline(
      s3ReadStream,
      csvStream,
      async (error) => {
        if (error) {
          return reject(error);
        }
        try {
          await s3.copyObject({
            CopySource: `${config.PRODUCT_CATALOGUE_S3_BUCKET}/${fileName}`,
            Bucket: config.PRODUCT_CATALOGUE_S3_BUCKET,
            Key: fileName.replace(config.UPLOADED_PATH, config.PARSED_PATH),
          });

          await s3.deleteObject({
            Bucket: config.PRODUCT_CATALOGUE_S3_BUCKET,
            Key: fileName
          });

          resolve();
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}