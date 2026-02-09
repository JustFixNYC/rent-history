We use AWS SAM for local development of our Lambda functions. To [get started with SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started.html) we need to install AWS CLI, install SAM CLI, and install the VS Code extension AWS Toolkit. You'll also need docker to invoke functions locally. 

[Video guide to using SAM with Lambda](https://youtu.be/rhBOuJqzABY?si=TyKpIZC2VC1CSrSY)

Since we already created some of our lambda functions via the console, we have [converted lambda functions to SAM applications](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/convert-lambda-to-sam.html). This allows us to locally develop, deploy and update, remotely test, and manage permissions and resources as code. I first did this via the AWS Toolkit VS Code extension.

Using the AWS Toolkit we can create a profile and sign-in to AWS via the console and automatically save the credentials for our session and refresh as needed.

For AWS and SAM CLI you also need to configure your AWS credentials. You can do this via the console in the browser with `aws login`.

Once you're all set up you can locally develop your lambda function, and use `sam local invoke` to run the function locally within Docker with a test event. Via Lambda on the AWS console you can create new test events from templates (eg. gateway api call, s3 event, etc) and then we can save the json in `/events`. Use the following command from within one of the `-stack` subdirectories to locally invoke the function with one of those test events using a particular AWS profile.


```sh
sam local invoke --event events/rh-scan-upload.json --profile justfix-maxwell
```

To update the code on AWS we can use `sam sync` for "quick-and-dirty" update for development. It's also possible to use `--watch` for automatic continuous updates as you make changes to the code.

`sam sync --profile justfix-maxwell`

Then when ready for deployment to production we should instead use `sam deploy --guided` for the full AWS Cloudformation deployment, and to be prompted for all of the additional required parameters which are saved for future deployments.

> TODO: I still need to learn more about SAM and Cloudformation and how best to handle all this stuff.
