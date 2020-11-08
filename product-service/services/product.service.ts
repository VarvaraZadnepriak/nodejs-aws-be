import { executeQuery, executeTransaction } from './postgres';
import { ProductDB } from './product.db';

export async function getProducts(): Promise<ProductDB[]> {
  const res = await executeQuery<ProductDB>(`
    SELECT id, title, description, price, image_url, count
    FROM products
    LEFT JOIN stocks ON products.id = stocks.product_id
  `);

  return res.rows || [];
}

export async function getProduct(productId: string): Promise<ProductDB> {
  const res = await executeQuery<ProductDB>(`
    SELECT id, title, description, price, image_url, count
    FROM products
    LEFT JOIN stocks ON products.id = stocks.product_id
    WHERE id = $1
  `, [productId]);

  return res.rows?.[0] || null;
}

export async function createProduct(product: ProductDB, count: number): Promise<string> {
  const {title, description, price, image_url} = product;

  return executeTransaction(async (client) => {
    const productRes = await client.query<{ id: string }>(`
      INSERT INTO products(title, description, price, image_url)
      VALUES($1, $2, $3, $4)
      RETURNING id
    `, [ title, description, price, image_url ]
    );
    const productId = productRes.rows[0].id;

    await client.query(`
      INSERT INTO stocks(product_id, count)
      VALUES($1, $2)
    `, [ productId, count ]
    );

    return productId;
  });
}
