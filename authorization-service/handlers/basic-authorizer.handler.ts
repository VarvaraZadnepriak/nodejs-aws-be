import {
  APIGatewayAuthorizerHandler,
  APIGatewayTokenAuthorizerEvent,
} from 'aws-lambda';

import logger from '../utils/logger.utils';
import {
  BasicScheme,
  StatementEffect,
  AuthorizerType,
  decodeBasicToken,
  generatePolicy,
} from '../utils/auth.utils';

export const basicAuthorizer: APIGatewayAuthorizerHandler = async (event: APIGatewayTokenAuthorizerEvent, _context) => {
  logger.log(`Event ===>`, event);

  try {
    const { authorizationToken, methodArn, type } = event;

    if (type !== AuthorizerType.Token) {
      throw new Error('Basic authorizer supports only token authorization type');
    }

    logger.log('Authorization Token: ', authorizationToken);

    const [ schema, encodedCredentials ] = authorizationToken.split(' ');
  
    if (schema !== BasicScheme) {
      logger.log('Token contains incorrect scheme for basic authorizer');

      return generatePolicy('none', methodArn, StatementEffect.Deny)
    }

    const { username, password } = decodeBasicToken(encodedCredentials);
    
    return username && password && process.env[username] === password
      ? generatePolicy(username, methodArn, StatementEffect.Allow)
      : generatePolicy(username, methodArn, StatementEffect.Deny);
  } catch (error) {
    console.log('Basic Authorizer Error', error.message, error.stack);

    throw error;
  }
}
