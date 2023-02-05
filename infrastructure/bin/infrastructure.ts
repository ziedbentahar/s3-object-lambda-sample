#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { S3ObjectLambdaSample } from "../lib/s3-object-lambda-sample";

const app = new cdk.App();
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new S3ObjectLambdaSample(app, S3ObjectLambdaSample.name, {
  stackName: S3ObjectLambdaSample.name,
  env,
});
