import { Request, Response } from 'express';
import * as httpProxy from 'http-proxy';
import * as https from 'https';

const pathRegex = /\/([\w-]+)(.*)/;

const proxyServer = httpProxy.createProxyServer();

proxyServer.on('proxyReq', function(proxyReq, req, _res, _options) {
    const [, , path] = req.originalUrl.match(pathRegex);
    proxyReq.path = path;   
 });

export function proxy(req: Request, res: Response, next: Function) {
  const { originalUrl, method } = req;
  const [, serviceName, path] = originalUrl.match(pathRegex);
  const target = process.env[serviceName];

  if (target) {
    if (serviceName === 'product' && path.endsWith('/products') && method === 'GET') {
      next();
    } else {
      const targetWithoutProtocol = target.split('//')[1];

      proxyServer.web(req, res, {
          secure: false,
          changeOrigin: true,
          target,
          agent: https.globalAgent,
          headers: {
            host: targetWithoutProtocol
          },
      });
    }

    return;
  }

  res.status(502).send('Cannot process request');
};