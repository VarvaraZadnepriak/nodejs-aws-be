import {
  APIGatewayAuthorizerHandler,
  APIGatewayTokenAuthorizerEvent,
} from 'aws-lambda';

import logger from '../utils/logger.utils';
import {
  StatementEffect,
  decodeBasicToken,
  generatePolicy,
} from '../utils/auth.utils';

export const basicAuthorizer: APIGatewayAuthorizerHandler = async (event: APIGatewayTokenAuthorizerEvent, _context) => {
  logger.log(`Event ===>`, event);

  try {
    const { authorizationToken, methodArn } = event;
    const { username, password } = decodeBasicToken(authorizationToken);
    
    return process.env[username] === password
      ? generatePolicy(username, methodArn, StatementEffect.Allow)
      : generatePolicy(username, methodArn, StatementEffect.Deny);
  } catch (error) {
    console.log('Basic Authorizer Error', error.message, error.stack);

    throw error;
  }
}
