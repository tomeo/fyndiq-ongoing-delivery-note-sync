const run = require('./sync');

const {
  DESCRIPTION,
  FYNDIQ_APIURL,
  FYNDIQ_USERNAME,
  FYNDIQ_APIKEY,
  FYNDIQ_SUFFIX,
  ONGOING_APIURL,
  ONGOING_GOODSOWNERID,
  ONGOING_USERNAME,
  ONGOING_PASSWORD,
  SLACK_WEBHOOK,
} = require('./config');

const fyndiq = {
  url: FYNDIQ_APIURL,
  username: FYNDIQ_USERNAME,
  apiKey: FYNDIQ_APIKEY,
  suffix: FYNDIQ_SUFFIX,
};

const ongoing = {
  apiUrl: ONGOING_APIURL,
  goodsOwnerId: ONGOING_GOODSOWNERID,
  username: ONGOING_USERNAME,
  password: ONGOING_PASSWORD,
};

const slack = {
  url: SLACK_WEBHOOK,
};

run(DESCRIPTION, fyndiq, ongoing, slack);
