# Tests in Lambda

This lambda function is triggered by uploading a `.jpg` file for a scan of a single page of a rent history in our S3 bucket `justfix-rh-scans`, and it then runs Textract's Analyze Document on the image to pull out the tables, extracts the data and standardizes it, then uploads the results as json data to a separate S3 bucket (later we'll instead save to the DB).

Note: This test simulates event triggered by a new scan page image being uploaded to S3. The file referenced needs to already exist so it can be accessed by the function.

rh-scan-upload

```json
{
  "Records": [
    {
      "eventVersion": "2.0",
      "eventSource": "aws:s3",
      "awsRegion": "us-east-1",
      "eventTime": "1970-01-01T00:00:00.000Z",
      "eventName": "ObjectCreated:Put",
      "userIdentity": {
        "principalId": "EXAMPLE"
      },
      "requestParameters": {
        "sourceIPAddress": "127.0.0.1"
      },
      "responseElements": {
        "x-amz-request-id": "EXAMPLE123456789",
        "x-amz-id-2": "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH"
      },
      "s3": {
        "s3SchemaVersion": "1.0",
        "configurationId": "testConfigRule",
        "bucket": {
          "name": "justfix-rh-scans",
          "ownerIdentity": {
            "principalId": "EXAMPLE"
          },
          "arn": "arn:aws:s3:::justfix-rh-scans"
        },
        "object": {
          "key": "2026-02-02T15-53-14-822Z/page1.jpg",
          "size": 1024,
          "eTag": "0123456789abcdef0123456789abcdef",
          "sequencer": "0A1B2C3D4E5F678901"
        }
      }
    }
  ]
}
```