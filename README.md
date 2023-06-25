Create Lambda function
=============

cd aws-lambda-schema-validation

 zip -r function.zip .

aws lambda create-function --function-name aws-lambda-schema-validation \
--zip-file fileb://function.zip --handler index.handler --runtime nodejs18.x \
--role arn:aws:iam::086674039837:role/lambda-kinesis-role --region eu-west-1

Invoke Lambda function
=============

aws lambda invoke --function-name aws-lambda-schema-validation \
--cli-binary-format raw-in-base64-out \
--payload file://input.txt outputfile.txt

Add trigger for Lambda function
===========
aws lambda create-event-source-mapping --function-name aws-lambda-schema-validation \
--event-source  arn:aws:kinesis:eu-west-1:086674039837:stream/lambda-stream \
--batch-size 5 --starting-position LATEST

aws lambda list-event-source-mappings --function-name aws-lambda-schema-validation \
--event-source arn:aws:kinesis:eu-west-1:086674039837:stream/lambda-stream

Send "hello world" to kinesis
=============
aws kinesis put-record --stream-name lambda-stream --partition-key 1 --data "SGVsbG8gd29ybGQ=" --region eu-west-1 

Redeploy Lambda Function
=============
cd sam-demo/aws-lambda-kinesis-data-stream

zip -r function.zip .

aws lambda update-function-code \
    --function-name  aws-lambda-schema-validation \
    --zip-file fileb://function.zip

Write to Kinesis Data Stream from Node.js
============
cd tester-winston-kinesis-data-stream
node index.js

References
============
https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis-example.html
