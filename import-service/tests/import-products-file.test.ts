import { APIGatewayProxyEvent, Context } from 'aws-lambda'; 

import config from '../config';
import { importProductsFile, INCORRECT_FILENAME_MESSAGE } from '../handler';
import { HttpCode } from '../utils/http.utils';
import { CORS_HEADERS } from '../utils/handler.utils';

const mockGetSignedUrlPromise = jest.fn();

jest.mock('aws-sdk', () => {
  return {
    S3: jest.fn(() => ({
      getSignedUrlPromise: mockGetSignedUrlPromise
    })
  )}
});

describe('Import Products File Lambda', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate and return signed link', async () => {
    const name = 'test.csv';
    const event = {
      queryStringParameters: {
        name,
      }
    } as unknown as APIGatewayProxyEvent;
    const context = {} as unknown as Context;
    const signedUrl = 'https://bucket/filename';

    mockGetSignedUrlPromise.mockImplementationOnce(() => Promise.resolve(signedUrl));
    
    const res = await importProductsFile(event, context);
    
    expect(mockGetSignedUrlPromise).toBeCalledWith('putObject', {
      Bucket: config.PRODUCT_CATALOGUE_S3_BUCKET,
      Key: `${config.UPLOADED_PATH}/${name}`,
      Expires: 60,
      ContentType: 'text/csv'
    });
    
    expect(res).toEqual({
      statusCode: HttpCode.OK,
      headers: CORS_HEADERS,
      body: signedUrl
    });
  });

  it('should fail with 400 error on incorrect filenames', async () => {
    const name = 'test.NOT_CSV';
    const event = {
      queryStringParameters: {
        name,
      }
    } as unknown as APIGatewayProxyEvent;
    const context = {} as unknown as Context;
    
    const res = await importProductsFile(event, context);
    expect(mockGetSignedUrlPromise).not.toBeCalled();
    
    expect(res).toEqual({
      statusCode: HttpCode.BAD_REQUEST,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        statusCode: HttpCode.BAD_REQUEST,
        message: INCORRECT_FILENAME_MESSAGE,
      })
    });
  });

  it('should fail with 500 error', async () => {
    const error = new Error('Mock error');
    const name = 'test.csv';
    const event = {
      queryStringParameters: {
        name,
      }
    } as unknown as APIGatewayProxyEvent;
    const context = {} as unknown as Context;

    mockGetSignedUrlPromise.mockImplementationOnce(() => Promise.reject(error));
    
    const res = await importProductsFile(event, context);
    
    expect(res).toEqual({
      statusCode: HttpCode.SERVER_ERROR,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        statusCode: HttpCode.SERVER_ERROR,
        message: error.message,
      })
    });
  });
});
