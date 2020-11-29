import logger from './logger.utils';

export const BasicScheme = 'Basic';

export enum StatementEffect {
  Allow = 'Allow',
  Deny = 'Deny' 
}

export type Credentials = {
  username: string;
  password: string;
}

export function decodeBasicToken(authorizationToken: string): Credentials {
  const decodedCredentials = Buffer.from(authorizationToken, 'base64').toString('utf-8');

  logger.log('Decoded credentials: ', decodedCredentials);

  const [ username, password ] = decodedCredentials.split(':');

  return {
    username,
    password,
  };
}

export function generatePolicy(username: string, methodArn: string, effect: StatementEffect) {
  return {
    principalId: username,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: methodArn
        }
      ]
    }
  };
}
