This is all of the code for an AWS Lambda function called `rhTextractStandardizeScanPage`. 

This function is triggered by `PUT`ing a `.jpg` file into our S3 bucket `justfix-rh-scans`. It then runs Textract's Analyze Document to extract tables from the uploaded rent history scanned page image, standardizes the output data, and writes JSON data to a separate S3 bucket `justfix-rh-textract`. (Later the results will instead be written to our `auth-provider` RDS database as a new records in the `textract` table.)

To update the packages for the Lambda function, navigate to the `src` folder and run `npm run build` to transpile the typescript and create a zip archive (including the `node_modules`) to upload to Lambda.

On the Code tab the Runtime Setting need to be updated for the handler to be `dist/index.js`.
