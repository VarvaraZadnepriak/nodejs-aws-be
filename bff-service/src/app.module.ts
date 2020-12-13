import { HttpModule, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [HttpModule],
  controllers: [ProductController],
  providers: [ProductService, CacheService],
})
export class AppModule {}
