import * as productCtrl from './product.ctrl';

import * as productService from '../services/product.service';
import { ProductDB } from '../services/product.db';
import { ProductDT } from './product.dt';
import { HttpCode, HttpError } from '../utils/http.utils';

jest.mock('../services/product.service');

const MOCK_ERROR = new Error('MOCK_ERROR');

const MOCK_PRODUCT_ID = '11111111-1111-1111-1111-111111111111';

const MOCK_PRODUCTS_DB: ProductDB[] = [
  {
    id: MOCK_PRODUCT_ID,
    title: '11',
    description: '111',
    price: 1,
    image_url: '1.jpg',
    count: 1,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: '22',
    description: '222',
    price: 2,
    image_url: '2.jpg',
    count: 2,
  },
];

const MOCK_PRODUCTS_DT: ProductDT[] = [
  {
    id: MOCK_PRODUCT_ID,
    title: '11',
    description: '111',
    price: 1,
    imageUrl: '1.jpg',
    count: 1,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: '22',
    description: '222',
    price: 2,
    imageUrl: '2.jpg',
    count: 2,
  },
];


describe('ProductCtrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  })

  describe('getProducts', () => {
    it('should return products list', async () => {
      (productService.getProducts as any).mockImplementation(
        () => Promise.resolve(MOCK_PRODUCTS_DB)
      );
  
      const result = await productCtrl.getProducts();
  
      expect(productService.getProducts).toBeCalled();
      expect(result).toEqual(MOCK_PRODUCTS_DT);
    });
  
    it('should re-throw error if productService fails', async () => {
      (productService.getProducts as any).mockImplementation(
        () => Promise.reject(MOCK_ERROR)
      );
  
      expect(productCtrl.getProducts()).rejects.toEqual(MOCK_ERROR);
    });
  });
  
  describe('getProduct(:productId)', () => {
    it('should return products by id', async () => {
      (productService.getProduct as any).mockImplementation(
        () => Promise.resolve(MOCK_PRODUCTS_DB[0])
      );
  
      const result = await productCtrl.getProduct(MOCK_PRODUCT_ID);
  
      expect(productService.getProduct).toBeCalledWith(MOCK_PRODUCT_ID);
      expect(result).toEqual(MOCK_PRODUCTS_DT[0]);
    });

    it('should validate that productsId is UUID', async () => {
      (productService.getProduct as any).mockImplementation(
        () => Promise.resolve(MOCK_PRODUCTS_DB[0])
      );
  
      expect(productCtrl.getProduct('INVALID-UUID')).rejects.toEqual(
        new HttpError(
          HttpCode.BAD_REQUEST,
          'Invalid productId uuid'
        )
      );
    });

    it('should fail with 400 code if product not found', async () => {
      (productService.getProduct as any).mockImplementation(
        () => Promise.resolve(null)
      );
  
      expect(productCtrl.getProduct(MOCK_PRODUCT_ID)).rejects.toEqual(
        new HttpError(
          HttpCode.NOT_FOUND,
          `Product with id: ${MOCK_PRODUCT_ID} was not found`
        )
      );
    });
  
    it('should re-throw error if productService fails', async () => {
      (productService.getProduct as any).mockImplementation(
        () => Promise.reject(MOCK_ERROR)
      );
  
      expect(productCtrl.getProduct(MOCK_PRODUCT_ID)).rejects.toEqual(MOCK_ERROR);
    });
  });
});
