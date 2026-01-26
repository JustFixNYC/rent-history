This is all of the code for an AWS Lambda function called `rhTextractStandardizeScanPage`. 

This function is triggered by `PUT`ing a `.jpg` file into our S3 bucket `justfix-rh-scans`. It then runs Textract's Analyze Document to extract tables from the uploaded rent history scanned page image, standardizes the output data, and writes the results to our `auth-provider` RDS database as a new records in the `textract` table.

To update the packages for the Lambda function, navigate to this folder and run `bash createLambdaZip.sh` to create a zip archive of the folders contents (including the `node_modules`) to upload to Lambda.

If you're only making code changes, you could also just edit directly in AWS but make sure to copy any changes here so we keep this version controlled version.
