require('dotenv').config();

const config = {
  AWS_KEY: process.env.AWS_ACCESS_KEY_IDD,
  AWS_SECRET: process.env.AWS_SECRET_ACCESS_KEYY,
  AWS_BUCKET: process.env.AWS_BUCKET_NAME,
  ENCODE_BASE:process.env.ENCODE_BASE

}

module.exports = config
