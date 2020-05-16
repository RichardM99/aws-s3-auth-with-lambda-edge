#!/bin/bash

REGION="us-east-1"
STAGE=$1

# cloud formation builds need a bucket in their region
#
S3_BUILD_BUCKET="my-cfn-builds-${REGION}"

TEMPLATE_FILE_PATH="./template.yaml"
GENERATED_TEMPLATE_FILE_PATH="./gen/template.yaml"
STACK_NAME="my-cloud-front-bucket-authenticator-${STAGE}"

# create a bucket for our cloud formation packages if it does not exist
#
echo "Check if bucket '${S3_BUILD_BUCKET}' exists in ${REGION}"
aws s3api head-bucket --bucket ${S3_BUILD_BUCKET} || not_exist=true
if [[ ${not_exist} ]]; then
  echo "'${S3_BUILD_BUCKET}' does not exist"
  echo "Create '${S3_BUILD_BUCKET}'"

  aws s3 mb s3://${S3_BUILD_BUCKET} --region ${REGION} --endpoint-url https://s3.${REGION}.amazonaws.com
else
  echo "'${S3_BUILD_BUCKET}' exists"
fi

echo "Clean up old build artifacts"
rm ./src/src.zip

echo "Package code and dependencies"
# start a sub-shell to execute npm run command in specified folder
( cd ./src && npm install && zip -r src.zip . )

echo "Upload content for '${TEMPLATE_FILE_PATH}' to '${S3_BUILD_BUCKET}'"
aws cloudformation package \
    --s3-bucket $S3_BUILD_BUCKET \
    --template-file $TEMPLATE_FILE_PATH \
    --output-template-file $GENERATED_TEMPLATE_FILE_PATH

echo "Deploy '${STACK_NAME}' stack for '${GENERATED_TEMPLATE_FILE_PATH}'"
aws cloudformation deploy \
    --region $REGION \
    --template-file $GENERATED_TEMPLATE_FILE_PATH \
    --stack-name $STACK_NAME \
    --parameter-overrides Stage=$STAGE \
    --capabilities CAPABILITY_IAM
