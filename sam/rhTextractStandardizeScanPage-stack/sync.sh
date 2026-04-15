#!/bin/bash

cd LambdaFunctionFunctionrhTextractStandardizeScanPage/
npm run build

cd ..
sam sync --profile justfix-maxwell
