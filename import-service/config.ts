export default {
  JEST: process.env.JEST === 'true',
  IS_OFFLINE: process.env.IS_OFFLINE,
  S3_LOCAL_HOST: process.env.S3_LOCAL_HOST,
  S3_LOCAL_PORT: process.env.S3_LOCAL_PORT,
  S3_LOCAL_ACCESS_KEY: process.env.S3_LOCAL_ACCESS_KEY,
  PRODUCT_CATALOGUE_S3_BUCKET: process.env.PRODUCT_CATALOGUE_S3_BUCKET,
  UPLOADED_PATH: process.env.UPLOADED_PATH,
  PARSED_PATH: process.env.PARSED_PATH,
};