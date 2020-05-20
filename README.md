# aws-s3-auth-with-lambda-edge
Authenticate Requests to an S3 Bucket with 
[Lambda@Edge](https://aws.amazon.com/lambda/edge/) &amp; 
[CloudFront](https://aws.amazon.com/cloudfront/)

### Overview
By leveraging [AWS Cloud Formation Templates](https://aws.amazon.com/cloudformation/resources/templates/) 
we can create and deploy the required infrastructure to authenticate
requests to an S3 bucket with one command.

### Requirements
* An AWS account
* AWS CLI installed on your machine with the 
correct [IAM Permissions](https://aws.amazon.com/iam/)
* Node & npm

### Getting Started
* Clone this repo & cd into root directory
* run `npm install`
* Create and deploy your stack with the following command

```
bash ./scripts/deploy {dev-or-prod} {your-unique-bucket-name}`
```

e.g

```
bash ./scripts/deploy dev my-super-awesome-bucket
```

Note - the bucket name must be unique (globally - not only to your account)

* It may take a few minutes to complete as AWS creates your resources, but once it does
(and there are no errors in the terminal) you are done.
* To test, put a file in the bucket and get the domain name of your cloud front 
distribution (found in the general tab of your cloud front distribution in your AWS console)
* Make a GET request using [Postman](https://www.postman.com/) (or whichever method you prefer) 
to the resource, first without adding the authorization header e.g.

```
GET {your-cloud-front-domain-name}/{name-of-your-file}.{ext}
```

* You should get back "Unauthorized"
* Now make the same request with header 

```
Authorization: SECRET_ACCESS_KEY
```

* You should get back the requested resource.

### Customisation

#### Authentication 
* As indicated in the code, you can simply replace the `hasAccessCheck` function with your own
logic for handling the validation. 

#### Stack Creation / Updating
* Running the deploy command again will update the target stack so long as you have not changed
the stack name in the deploy script. So, for instance, you can modify the lambda function and
running the deploy command again will apply your changes.
* You can view the resources created in the cloud formation section of your AWS console.
* You can modify the `template.yaml` and `deploy.sh` files as you wish if you want to change some of
the naming conventions or modify the stack creation process.
* However - prior knowledge of how cloud formation templates work is encouraged before trying to do so.

### Troubleshooting
* If something went wrong during the deployment, the easiest way to debug is to go to
the cloud formation section of your AWS console and look through the event logs. There you will find
exactly which problem occurred (e.g. bucket name was not unique)
* Read up on [Requirements and Restrictions of Lambda Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-requirements-limits.html)  
as well as the general [AWS Documentation](https://docs.aws.amazon.com/) to better understand which issues you 
may encounter.


### Contact
Please feel free to contact me if you have any questions!
