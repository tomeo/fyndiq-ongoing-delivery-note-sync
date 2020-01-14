# Fyndiq/Ongoing Delivery Note Sync
Fetches delivery notes for pending orders in Fyndiq and posts them to the corresponding orders in Ongoing WMS.

### Run locally
1. Rename `config.example.js` and replace the values/set env vars.
```
cp config.example.js config.js
```
2. Run `npm install`.
3. Run `node index.js`.

### Deploy as AWS Lambda
1. Create AWS account
2. Create SSM Parameter Store parameters (See SSM Parameter Store)
3. Edit `serverless.yml` to use your values
4. Run `serverless deploy`

#### SSM Parameter Store
Make sure aws-cli is installed.

```
# CDON parameters
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/fyndiq/apiurl" --value "https://api.fyndiq.com/api/v2" --type "SecureString"
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/fyndiq/apikey" --value "{{YOUR FYNDIQ API KEY}}" --type "SecureString"
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/fyndiq/suffix" --value "{{YOUR FYNDIQ ORDER NUMBER SUFFIX OR SPACE IF YOU DONT HAVE ONE}}" --type "SecureString"
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/fyndiq/username" --value "{{YOUR FYNDIQ USERNAME}}" --type "SecureString"

# Ongoing parameters
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/ongoing/apiurl" --value "{{YOUR ONGOING REST API URL}}" --type "String"
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/ongoing/goodsownerid" --value "{{YOUR GOODS OWNER ID}}" --type "SecureString"
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/ongoing/username" --value "{{YOUR ONGOING USERNAME}}" --type "SecureString"
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/ongoing/password" --value "{{YOUR ONGOING PASSWORD}}" --type "SecureString"

# Slack parameters
aws ssm put-parameter --name "/{{YOUR INSTANCE NAME}}/slack/omswebhook" --value "{{YOUR SLACK WEBHOOK}}" --type "SecureString"
```