import { SQSEvent } from 'aws-lambda';

import * as productService from '../services/product.service';
import { catalogBatchProcess } from '../handlers/catalogBatchProcess.handler';
import { ProductDB } from '../services/product.db';

const MOCK_PRODUCTS_DB: ProductDB[] = [
  {
    id: '1',
    title: '11',
    description: '111',
    price: 1,
    image_url: '1.jpg',
    count: 1,
  },
  {
    id: '2',
    title: '22',
    description: '222',
    price: 2,
    image_url: '2.jpg',
    count: 2,
  },
];

const mockPublish = jest.fn();
const mockDeleteMessage = jest.fn();

jest.mock('aws-sdk', () => {
  return {
    SNS: jest.fn(() => ({
      publish: mockPublish
    })),
    SQS: jest.fn(() => ({
      endpoint: {
        href: 'href',
      },
      deleteMessage: mockDeleteMessage
    })),
  }
});

jest.mock('../services/product.service');

describe('catalogBatchProcess lambda', () => {
  beforeEach(jest.clearAllMocks);

  it('Should correctly create products and post message to SNS', async () => {
    const sqsEvent = {
      Records: MOCK_PRODUCTS_DB.map((product, i) => ({
        receiptHandle: `${i}`,
        eventSourceARN: `${i}:${i}:${i}:${i}:${i}:${i}:${i}`,
        body: JSON.stringify(product)
      })),
    } as unknown as SQSEvent;

    (productService.createProduct as any).mockImplementation(
      () => Promise.resolve('1')
    );

    mockPublish.mockImplementation((_params, cb) => cb(undefined));

    mockDeleteMessage.mockImplementation(() => ({
      promise: () => Promise.resolve()
    }));

    await catalogBatchProcess(sqsEvent);

    expect(productService.createProduct).toHaveBeenCalledTimes(2);
    expect(mockPublish.mock.calls[0][0]).toEqual(
      {"Message": "{\"id\":\"1\",\"title\":\"11\",\"description\":\"111\",\"price\":1,\"image_url\":\"1.jpg\",\"count\":1}", "MessageAttributes": {"price": {"DataType": "Number", "StringValue": "1"}}, "Subject": "New product added", "TopicArn": undefined}
    );
    expect(mockPublish.mock.calls[1][0]).toEqual(
      {"Message": "{\"id\":\"2\",\"title\":\"22\",\"description\":\"222\",\"price\":2,\"image_url\":\"2.jpg\",\"count\":2}", "MessageAttributes": {"price": {"DataType": "Number", "StringValue": "2"}}, "Subject": "New product added", "TopicArn": undefined}
    );
    expect(mockDeleteMessage.mock.calls[0][0]).toEqual(
      {"QueueUrl": "href0/0", "ReceiptHandle": "0"}
    );
    expect(mockDeleteMessage.mock.calls[1][0]).toEqual(
      {"QueueUrl": "href1/1", "ReceiptHandle": "1"}
    );
  });

  it('Should correctly handle failures', async () => {
    const sqsEvent = {
      Records: MOCK_PRODUCTS_DB.map((product, i) => ({
        receiptHandle: `${i}`,
        eventSourceARN: `${i}:${i}:${i}:${i}:${i}:${i}:${i}`,
        body: JSON.stringify(product)
      })),
    } as unknown as SQSEvent;

    (productService.createProduct as any).mockImplementation(
      () => Promise.reject('FAIL')
    );

    mockPublish.mockImplementation((_params, cb) => cb(undefined));

    mockDeleteMessage.mockImplementation(() => ({
      promise: () => Promise.resolve()
    }));

    await catalogBatchProcess(sqsEvent);

    expect(productService.createProduct).toHaveBeenCalledTimes(2);
    expect(mockPublish.mock.calls[0][0]).toEqual(
      {"Message": "{\"id\":\"1\",\"title\":\"11\",\"description\":\"111\",\"price\":1,\"image_url\":\"1.jpg\",\"count\":1}", "MessageAttributes": {"price": {"DataType": "Number", "StringValue": "1"}}, "Subject": "New product FAIL", "TopicArn": undefined}
    );
    expect(mockPublish.mock.calls[1][0]).toEqual(
      {"Message": "{\"id\":\"2\",\"title\":\"22\",\"description\":\"222\",\"price\":2,\"image_url\":\"2.jpg\",\"count\":2}", "MessageAttributes": {"price": {"DataType": "Number", "StringValue": "2"}}, "Subject": "New product FAIL", "TopicArn": undefined}
    );
    expect(mockDeleteMessage).not.toBeCalled();
  });
});
