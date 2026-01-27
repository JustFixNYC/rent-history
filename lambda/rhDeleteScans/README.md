This is all of the code for an AWS Lambda function called `rhDeleteScans`. 

This function is triggered by a GET request to our `justfix-rh` HTTP Gateway API's `/rhDeleteScans` endpoint with the param `history_code`, and it will delete all of the files with that prefix in our S3 bucket `justfix-rh-scans`.

To update the packages for the Lambda function, navigate to this folder and run `bash createLambdaZip.sh` to create a zip archive of the folders contents (including the `node_modules`) to upload to Lambda.

If you're only making code changes, you could also just edit directly in AWS but make sure to copy any changes here so we keep this version controlled version.