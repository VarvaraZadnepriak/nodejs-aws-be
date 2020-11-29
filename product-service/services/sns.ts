import { SNS } from 'aws-sdk';
import {
  PublishInput,
  PublishResponse,
} from 'aws-sdk/clients/sns';

import logger from '../utils/logger.utils';

function getSNSClient(): SNS {
  return new SNS();
}

export function publishSNSMessage(params: PublishInput): Promise<PublishResponse> {
  const sns = getSNSClient();

  return new Promise((resolve, reject) => {
    sns.publish(params, (error, response) => {
      if (error) {
        logger.error('SNS Error: ', error);
        reject(error);
      } else {
        logger.log('SNS Response: ', response);
        resolve(response);
      }
    });
  });
}