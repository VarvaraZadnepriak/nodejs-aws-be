// setup.js
module.exports = async () => {
  process.env.JEST = 'true',
  process.env.PRODUCT_CATALOGUE_S3_BUCKET = 'PRODUCT_CATALOGUE_S3_BUCKET';
  process.env.UPLOADED_PATH = 'UPLOADED_PATH';
};