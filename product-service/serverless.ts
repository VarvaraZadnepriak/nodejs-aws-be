import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service',
  },
  frameworkVersion: '2',
  plugins: [
    'serverless-webpack',
    'serverless-offline',
    'serverless-aws-documentation'
  ],
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    },
    'serverless-offline': {
      httpPort: 8000
    },
    documentation: {
      api: {
        info: {
          version: '1',
          title: 'Product Service API',
          description: 'Product Service API'
        }
      },
      models: [{
        name: 'Product',
        description: 'Product model',
        contentType: 'application/json',
        schema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Product identifier',
            },
            title: {
              type: 'string',
              description: 'Product title',
            },
            description: {
              type: 'string',
              description: 'Product description',
            },
            price: {
              type: 'number',
              description: 'Product price',
            },
            imageUrl: {
              type: 'string',
              description: 'Product imageUrl',
            }
          }
        }
      }, {
        name: 'ProductList',
        description: 'List of products',
        contentType: 'application/json',
        schema: {
          type: 'array',
          items: {
            $ref: '{{model: Product}}'
          }
        }
      }, {
        name: 'ServiceError',
        description: 'Service error',
        contentType: 'application/json',
        schema: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'number',
              description: 'Status code of error'
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }]
    }
  },
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
  },
  functions: {
    getProduct: {
      handler: 'handler.getProduct',
      events: [
        {
          http: {
            method: 'get',
            path: '/products/{productId}',
            cors: true,
            documentation: {
              description: 'Get product by productId',
              pathParams: [{
                name: 'productId',
                description: 'Product identifier'
              }],
              methodResponses: [{
                statusCode: '200',
                responseModels: {
                  'application/json': 'Product'
                }
              }, {
                statusCode: '404',
                responseModels: {
                  'application/json': 'ServiceError'
                }
              }, {
                statusCode: '500',
                responseModels: {
                  'application/json': 'ServiceError'
                }
              }]
            }
          } as any
        }
      ]
    },
    getProducts: {
      handler: 'handler.getProducts',
      events: [
        {
          http: {
            method: 'get',
            path: '/products',
            cors: true,
            documentation: {
              description: 'Get all products',
              methodResponses: [{
                statusCode: '200',
                responseModels: {
                  'application/json': 'ProductList'
                }
              }, {
                statusCode: '500',
                responseModels: {
                  'application/json': 'ServiceError'
                }
              }]
            }
          } as any
        }
      ]
    }
  }
}

module.exports = serverlessConfiguration;
