import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: 'import-service',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    },
    s3: {
      host: '${env:S3_LOCAL_HOST}',
      port: '${env:S3_LOCAL_PORT}',
    },
  },
  plugins: [
    'serverless-webpack',
    'serverless-dotenv-plugin',
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
      S3_LOCAL_HOST: '${env:S3_LOCAL_HOST}',
      S3_LOCAL_PORT: '${env:S3_LOCAL_PORT}',
      S3_LOCAL_ACCESS_KEY: '${env:S3_LOCAL_ACCESS_KEY}',
      PRODUCT_CATALOGUE_S3_BUCKET: '${env:PRODUCT_CATALOGUE_S3_BUCKET}',
      UPLOADED_PATH: '${env:UPLOADED_PATH}',
      PARSED_PATH: '${env:PARSED_PATH}',
      SQS_QUEUE_URL: {
        Ref: 'SQSQueue'
      },
    },
    iamRoleStatements: [{
      Effect: 'Allow',
      Action: 's3:*',
      Resource: 'arn:aws:s3:::${env:PRODUCT_CATALOGUE_S3_BUCKET}/*'
    }, {
      Effect: 'Allow',
      Action: 'sqs:*',
      Resource: {
        'Fn::GetAtt': ['SQSQueue', 'Arn'],
      }  
    }]
  },
  resources: {
    Resources: {
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${env:SQS_QUEUE_NAME}'
        }
      },
      GatewayResponseDefault4XX: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
          },
          ResponseType: 'DEFAULT_4XX',
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
        },
      },
    },
    Outputs: {
      SQSQueueUrl: {
        Value: {
          Ref: 'SQSQueue'
        }
      },
      SQSQueueArn: {
        Value: {
          'Fn::GetAtt': ['SQSQueue', 'Arn']
        }
      }
    },
  },
  functions: {
    importProductsFile: {
      handler: 'handler.importProductsFile',
      events: [{
        http: {
          method: 'get',
          path: '/import',
          cors: true,
          authorizer: {
            name: 'basicAuthorizer',
            arn: '${cf:authorization-service-${self:provider.stage}.BasicAuthorizerArn}',
            resultTtlInSeconds: 0,
            identitySource: 'method.request.header.Authorization',
            type: 'token',
          },
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
          bucket: '${env:PRODUCT_CATALOGUE_S3_BUCKET}',
          event: 's3:ObjectCreated:*',
          rules: [{
            prefix: '${env:UPLOADED_PATH}',
            suffix: '.csv',
          }],
          existing: true,
        }
      }]
    }
  }
}

module.exports = serverlessConfiguration;
