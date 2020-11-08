console.log(process.env.RS_APP_DB);
export default {
  JEST: process.env.JEST === 'true',
  RS_APP_DB: process.env.RS_APP_DB,
};