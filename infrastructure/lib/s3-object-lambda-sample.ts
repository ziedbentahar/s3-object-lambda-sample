import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
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
      "sensitive-fields-remover-lambda",
      {
        entry: resolve("../src/lambdas/remove-sensitive-fields.ts"),
        functionName: "remove-sensitive-fields",
        handler: "handler",
        memorySize: 512,
        timeout: Duration.seconds(10),
        runtime: Runtime.NODEJS_18_X,
        architecture: Architecture.ARM_64,
        logRetention: RetentionDays.THREE_DAYS,
        environment: {
          NODE_OPTIONS: "--enable-source-maps",
        },
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

    const accessPointName = "s3-object-lambda-access-point";
    new S3ObjectLambdaAccessPoint(this, "s3-object-lambda-access-point", {
      name: accessPointName,
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
    });

    contentTransfromationLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["s3-object-lambda:WriteGetObjectResponse"],
        resources: [
          `arn:aws:s3-object-lambda:${this.region}:${this.account}:accesspoint/${accessPointName}`,
        ],
      })
    );
  }
}
