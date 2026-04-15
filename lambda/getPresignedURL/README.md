This is all of the code for an AWS Lambda function called `getPresignedURL`. 

This function is triggered by a GET request to an HTTP Gateway API with parameters `method` (`"GET"` or `"PUT"`), and `key` (S3 key for the object). To get presigned URLs for multiple files, set multiple values for `key` (eg. `<URL>?method=GET&key=user1/page1.jpg&key=user1/page2.jpg`). The function generates the presigned S3 url for either downloading or uploading a file for each of the keys provided, and returns a list of objects with `key` and `url`.

To update the packages for the Lambda function, navigate to this folder and run `bash createLambdaZip.sh` to create a zip archive of the folders contents (including the `node_modules`) to upload to Lambda.

If you're only making code changes, you could also just edit directly in AWS but make sure to copy any changes here so we keep this version controlled version.