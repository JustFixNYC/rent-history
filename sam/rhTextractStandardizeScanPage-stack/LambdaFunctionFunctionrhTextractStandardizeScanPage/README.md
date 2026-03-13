This is all of the code for an AWS Lambda function called `rhTextractStandardizeScanPage`. 

This function is triggered by `PUT`ing a `.jpg` file into our S3 bucket `justfix-rh-scans`. It then runs Textract's Analyze Document to extract tables from the uploaded rent history scanned page image, standardizes the output data, and writes JSON data to a separate S3 bucket `justfix-rh-textract`. (Later the results will instead be written to our `auth-provider` RDS database as a new records in the `textract` table.)

Since we re using Typescript, we need to change the default location of th Handler to use the `dist/index.handler`. This can be done on the AWS Console from Lambda's Runtime tab, but now we are managing this via our SAM template.

To get/update local test data for development of the standardization process use the following AWS CLI commands:

```sh
aws s3 sync s3://justfix-rh-scans/test-data/ test-scans/
aws s3 sync s3://justfix-rh-textract/test-data/ test-textract/
```
