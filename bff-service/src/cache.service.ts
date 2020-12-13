import { Injectable } from '@nestjs/common';

const CACHE_EXPIRATION_TIME = 120000; /* 2 minutes */

@Injectable()
export class CacheService {
  private _inMemoryCache = {};
  
  get(key: string): any {
    return this._inMemoryCache[key];
  }

  set(key: string, value: any, expire = CACHE_EXPIRATION_TIME): any {
    this._inMemoryCache[key] = value;

    setTimeout(() => {
      this._inMemoryCache[key] = null;
    }, expire);
  }
}
