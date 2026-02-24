#!/bin/bash

cd LambdaFunctionFunctionrhTextractStandardizeScanPage/
npm run build

cd ..
sam build
sam local invoke --event events/rh-scan-upload.json --profile justfix-maxwell

cd LambdaFunctionFunctionrhTextractStandardizeScanPage/
aws s3 sync s3://justfix-rh-textract/test-data/ test-textract/

cd ..
