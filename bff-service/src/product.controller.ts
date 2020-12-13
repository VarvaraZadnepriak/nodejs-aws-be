import { Controller, Get } from '@nestjs/common';
import { CacheService } from './cache.service';
import { ProductService } from './product.service';

const CACHE_KEY = 'product';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly cacheService: CacheService,
    ) {}

  @Get('/dev/products')
  async getProducts() {
    let products = this.cacheService.get(CACHE_KEY);

    if (!products) {
      products = await this.productService.getProducts();
      this.cacheService.set(CACHE_KEY, products);
    }

    return products;
  }
}
