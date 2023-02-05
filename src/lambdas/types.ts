export type S3ObjectLambdaEvent = {
  getObjectContext: {
    outputRoute: string;
    outputToken: string;
    inputS3Url: string;
  };
};

export type InventoryItem = {
  itemReference: string;
  itemPrice: string;
  contactEmail: string;
  itemContratReference: string;
  description: string;
  itemRating: string;
};
