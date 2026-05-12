const {
  CreateTableCommand,
  DescribeTableCommand,
} = require("@aws-sdk/client-dynamodb");
const { client } = require("../config/dynamodb");
require("dotenv").config();

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "Products";

async function createTable() {
  try {
    // Check if table already exists
    await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    console.log(`✅ Table "${TABLE_NAME}" already exists.`);
    return;
  } catch (err) {
    if (err.name !== "ResourceNotFoundException") throw err;
  }

  // Create the table
  const params = {
    TableName: TABLE_NAME,
    KeySchema: [{ AttributeName: "productId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "productId", AttributeType: "S" },
      { AttributeName: "category", AttributeType: "S" },
      { AttributeName: "platform", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "category-index",
        KeySchema: [{ AttributeName: "category", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
        BillingMode: "PAY_PER_REQUEST",
      },
      {
        IndexName: "platform-index",
        KeySchema: [{ AttributeName: "platform", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
        BillingMode: "PAY_PER_REQUEST",
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  };

  await client.send(new CreateTableCommand(params));
  console.log(`✅ Table "${TABLE_NAME}" created successfully!`);
}

createTable().catch(console.error);
