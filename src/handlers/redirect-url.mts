import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import ShortUniqueId from 'short-unique-id';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand } from '@aws-sdk/lib-dynamodb';
const uid = new ShortUniqueId();
const docClient = new DynamoDBClient({ region: "us-east-1" });
const tableName = process.env.TABLE_NAME;
const id = uid.rnd();
export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> =>{
    const { httpMethod, pathParameters  } = event;
    if (httpMethod === "GET") {
    try {
        const shortId = pathParameters?.shortId;
        if (!shortId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing Short ID" }),
            };
        }
        const result = await docClient.send(
            new GetCommand({
              TableName: tableName,
              Key: { Item: { id: shortId } },
            })
        );
        if (!result.Item?.longUrl) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "URL not found" }),
            };
        }
        return {
            statusCode: 301,
            headers: { Location: result?.Item?.longUrl },
            body: "",
          };
    } catch (error) {
        // console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
} return {
    statusCode: 404,
    body: JSON.stringify({ error: "Not Found" }),
  };
};