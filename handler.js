'use strict';

const AWS = require('aws-sdk');
const sync = require('./sync');

const ONGOING = {
  APIURL: `/${process.env.ACCOUNT}/ongoing/apiurl`,
  GOODSOWNERID: `/${process.env.ACCOUNT}/ongoing/goodsownerid`,
  USERNAME: `/${process.env.ACCOUNT}/ongoing/username`,
  PASSWORD: `/${process.env.ACCOUNT}/ongoing/password`,
};

const FYNDIQ = {
  APIURL: `/${process.env.ACCOUNT}/fyndiq/apiurl`,
  API_KEY: `/${process.env.ACCOUNT}/fyndiq/apikey`,
  USERNAME: `/${process.env.ACCOUNT}/fyndiq/username`,
  SUFFIX: `/${process.env.ACCOUNT}/fyndiq/suffix`,
};

const SLACK = {
  WEBHOOK: `/${process.env.ACCOUNT}/slack/omswebhook`,
};

const DESCRIPTION = process.env.DESCRIPTION;

const ssm = new AWS.SSM();
const keyPromise = ssm
  .getParameters({
    Names: [
      ONGOING.APIURL,
      ONGOING.GOODSOWNERID,
      ONGOING.USERNAME,
      ONGOING.PASSWORD,
      FYNDIQ.APIURL,
      FYNDIQ.API_KEY,
      FYNDIQ.USERNAME,
      FYNDIQ.SUFFIX,
      SLACK.WEBHOOK,
    ],
    WithDecryption: true,
  })
  .promise();

exports.handler = async event => {
  const result = await keyPromise;

  const ongoing = {
    apiUrl: result.Parameters.find(p => p.Name === ONGOING.APIURL)
      .Value,
    goodsOwnerId: result.Parameters.find(
      p => p.Name === ONGOING.GOODSOWNERID,
    ).Value,
    username: result.Parameters.find(p => p.Name === ONGOING.USERNAME)
      .Value,
    password: result.Parameters.find(p => p.Name === ONGOING.PASSWORD)
      .Value,
  };

  const fyndiq = {
    url: result.Parameters.find(p => p.Name === FYNDIQ.APIURL).Value,
    apiKey: result.Parameters.find(p => p.Name === FYNDIQ.API_KEY)
      .Value,
    username: result.Parameters.find(p => p.Name === FYNDIQ.USERNAME)
      .Value,
    suffix: result.Parameters.find(p => p.Name === FYNDIQ.SUFFIX)
      .Value,
  };

  const slack = {
    url: result.Parameters.find(p => p.Name === SLACK.WEBHOOK).Value,
  };

  return sync(DESCRIPTION, fyndiq, ongoing, slack);
};
