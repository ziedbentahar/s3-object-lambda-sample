import { S3 } from "aws-sdk";
import fetch from "node-fetch";
import { InventoryItem, S3ObjectLambdaEvent } from "./types";

const s3 = new S3({ region: process.env.AWS_REGION });

export const handler = async (event: S3ObjectLambdaEvent) => {
  const response = await fetch(event.getObjectContext.inputS3Url);
  let fileContentInJson = (await response.json()) as InventoryItem[];

  const filteredContent = fileContentInJson.map(
    ({ contactEmail, itemContratReference, itemRating, ...rest }) => rest
  );

  await s3
    .writeGetObjectResponse({
      RequestRoute: event.getObjectContext.outputRoute,
      RequestToken: event.getObjectContext.outputToken,
      Body: JSON.stringify(filteredContent),
    })
    .promise();

  return {
    statusCode: 200,
  };
};
