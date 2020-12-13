import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { proxy } from './proxy.middleware';

require('./config');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(proxy);
  app.enableCors();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
