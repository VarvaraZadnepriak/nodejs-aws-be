import {
  Endpoint,
  S3,
} from 'aws-sdk';
import { Readable } from 'stream';

import config from '../config';
import logger from '../utils/logger.utils';

function getS3Client(): S3 {
  return new S3({
    ...(config.IS_OFFLINE && {
      s3ForcePathStyle: true,
      accessKeyId: config.S3_LOCAL_ACCESS_KEY,
      secretAccessKey: config.S3_LOCAL_ACCESS_KEY,
      endpoint: new Endpoint(`http://${config.S3_LOCAL_HOST}:${config.S3_LOCAL_PORT}`),
    })
  });
}

export function getSignedUrlPromise(operation: string, params: any): Promise<string> {
  const s3 = getS3Client();
  return s3.getSignedUrlPromise(operation, params);
}

export function createObjectReadStream(params: S3.GetObjectRequest): Readable {
  const s3 = getS3Client();
  logger.log('getObject', params);
  return s3.getObject(params).createReadStream();
}

export function copyObject(params: S3.CopyObjectRequest): Promise<any> {
  const s3 = getS3Client();
  logger.log('copyObject');
  return s3.copyObject(params).promise();
}

export function deleteObject(params: S3.DeleteObjectRequest): Promise<any> {
  const s3 = getS3Client();
  logger.log('deleteObject');
  return s3.deleteObject(params).promise();
}

