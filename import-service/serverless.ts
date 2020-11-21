import type { Serverless } from 'serverless/aws';

const S3_LOCAL_HOST = 'localhost';
const S3_LOCAL_PORT = 4567;
const S3_LOCAL_ACCESS_KEY = 'S3RVER';

const PRODUCT_CATALOGUE_S3_BUCKET = 'product-catalogue-2235';
const UPLOADED_PATH = 'uploaded';
const PARSED_PATH = 'parsed';

const serverlessConfiguration: Serverless = {
  service: 'import-service',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    },
    s3: {
      host: S3_LOCAL_HOST,
      port: S3_LOCAL_PORT,
      region: S3_LOCAL_HOST,
    },
  },
  // Add the serverless-webpack plugin
  plugins: [
    'serverless-webpack',
    'serverless-s3-local',
    'serverless-offline',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      S3_LOCAL_HOST,
      S3_LOCAL_PORT,
      S3_LOCAL_ACCESS_KEY,
      PRODUCT_CATALOGUE_S3_BUCKET,
      UPLOADED_PATH,
      PARSED_PATH,
    },
    iamRoleStatements: [{
      Effect: 'Allow',
      Action: 's3:*',
      Resource: `arn:aws:s3:::${PRODUCT_CATALOGUE_S3_BUCKET}/*`
    }]
  },
  functions: {
    importProductsFile: {
      handler: 'handler.importProductsFile',
      events: [{
        http: {
          method: 'get',
          path: '/import',
          cors: true,
          request: {
            parameters: {
              querystrings: {
                name: true
              }
            }
          }
        }
      }]
    },
    importFileParser: {
      handler: 'handler.parseProductsFiles',
      events: [{
        s3: {
          bucket: PRODUCT_CATALOGUE_S3_BUCKET,
          event: 's3:ObjectCreated:*',
          rules: [{
            prefix: UPLOADED_PATH,
            suffix: '.csv',
          }],
          existing: true,
        }
      }]
    }
  }
}

module.exports = serverlessConfiguration;
