import { Pool, PoolClient } from 'pg';

import config from '../config';
import logger from '../utils/logger.utils';

const pool = new Pool({
  connectionString: config.RS_APP_DB
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // TODO: how to handle?
});

export async function executeQuery<T>(query: string, values?: any[]) {
  let client: PoolClient;

  try {
    client = await pool.connect();
  
    const res = await client.query<T>(query, values);

    return res;
  } catch (err) {
    logger.error(`Postgres Error:`, err.message, err.stack);

    throw new Error(`Postgres failed: ${err.message}`);
  } finally {
    client && client.release();
  }
}

export async function executeTransaction<T>(transactionQueriesFn: (client: PoolClient) => Promise<T>) {
  let client: PoolClient;

  try {
    client = await pool.connect();

    await client.query('BEGIN');
    const res = await transactionQueriesFn(client);
    await client.query('COMMIT');

    return res;
  } catch (err) {  
    logger.error(`Postgres Error:`, err.message, err.stack);

    await client.query('ROLLBACK');
  
    throw new Error(`Postgres failed: ${err.message}`);
  } finally {
    client && client.release();
  }
}