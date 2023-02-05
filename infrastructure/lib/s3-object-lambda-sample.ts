import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket, CfnAccessPoint as S3AccessPoint } from "aws-cdk-lib/aws-s3";
import { CfnAccessPoint as S3ObjectLambdaAccessPoint } from "aws-cdk-lib/aws-s3objectlambda";
import { Construct } from "constructs";
const resolve = require("path").resolve;

export class S3ObjectLambdaSample extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "sample-bucket", {
      bucketName: "s3-object-lambda-sample-bucket",
    });

    const contentTransfromationLambda = new NodejsFunction(
      this,
      "SensitiveFieldsRemoverLambda",
      {
        entry: resolve("../src/lambdas/remove-sensitive-fields.ts"),
        functionName: "remove-sensitive-fields",
        handler: "handler",
        memorySize: 512,
        timeout: Duration.seconds(10),
      }
    );

    const s3AccessPoint = new S3AccessPoint(
      this,
      "s3-object-lambda-sample-access-point",
      {
        bucket: bucket.bucketName,
        name: "access-point",
      }
    );

    const s3ObjectLambdaAccessPoint = new S3ObjectLambdaAccessPoint(
      this,
      "s3-object-lambda-access-point",
      {
        name: "s3-object-lambda-access-point",
        objectLambdaConfiguration: {
          supportingAccessPoint: `arn:aws:s3:${this.region}:${this.account}:accesspoint/${s3AccessPoint.name}`,
          transformationConfigurations: [
            {
              actions: ["GetObject"],
              contentTransformation: {
                AwsLambda: {
                  FunctionArn: contentTransfromationLambda.functionArn,
                },
              },
            },
          ],
        },
      }
    );

    const writeObjectResponsePolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3-object-lambda:WriteGetObjectResponse"],
      resources: ["*"],
    });

    contentTransfromationLambda.addToRolePolicy(writeObjectResponsePolicy);
  }
}