import { SQSRecord } from 'aws-lambda';
import { SQS } from 'aws-sdk';

import logger from '../utils/logger.utils';

function getSQSClient(): SQS {
  return new SQS();
}

function getQueueUrl ({ sqs, eventSourceARN }) {
  const [, , , , accountId, queueName] = eventSourceARN.split(':');
  return `${sqs.endpoint.href}${accountId}/${queueName}`;
}

export async function deleteMessage(record: SQSRecord): Promise<void> {
  const sqs = getSQSClient();

  await sqs.deleteMessage({
    QueueUrl: getQueueUrl({
      sqs,
      eventSourceARN: record.eventSourceARN
    }),
    ReceiptHandle: record.receiptHandle
  }).promise().then(() => {
    logger.log('SQS: Message removed', JSON.parse(record.body));
  }, (error) => {
    logger.error('SQS: Message remove failed', JSON.parse(record.body), error);
  })
}