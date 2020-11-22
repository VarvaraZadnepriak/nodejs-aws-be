import { SQS } from 'aws-sdk';
import {
  SendMessageRequest,
  SendMessageResult,
} from 'aws-sdk/clients/sqs';

import logger from '../utils/logger.utils';

function getSQSClient(): SQS {
  return new SQS();
}

export function sendSQSMessage(params: SendMessageRequest): Promise<SendMessageResult> {
  const sqs = getSQSClient();

  return new Promise((resolve, reject) => {
    sqs.sendMessage(params, (error, response) => {
      if (error) {
        logger.error('SQS Error: ', error);
        reject(error);
      } else {
        logger.log('SQS Response: ', response);
        resolve(response);
      }
    });
  });
}