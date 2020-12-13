import { HttpService, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';

@Injectable()
export class ProductService {
  constructor(private httpService: HttpService) {}

  async getProducts(): Promise<any> {
    const { data } = await this.httpService.get(`${process.env['product']}/dev/products`).toPromise();

    return data;
  }
}
