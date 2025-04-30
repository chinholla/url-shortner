import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import ShortUniqueId from 'short-unique-id';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from '@aws-sdk/lib-dynamodb';
const uid = new ShortUniqueId();
const docClient = new DynamoDBClient({ region: "us-east-1" });
const tableName = process.env.TABLE_NAME;
const id = uid.rnd();
export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { path, httpMethod, body } = event;
    if (httpMethod === "POST" && path === "/shorten") {
        const { longUrl } = JSON.parse(body || "{}");
    try {
        if (!longUrl) {
            return {
              statusCode: 400,
              body: JSON.stringify({ error: "Missing URL" }),
            };
        }
        await docClient.send(new PutCommand({
            TableName: tableName,
            Item: {
                id: id,
                longUrl
            }
        }));
        return {
            statusCode: 201,
            body: JSON.stringify({ shortUrl: `https://${event.headers.Host}/Prod/${id}` })
        };
    } catch (error) {
        // console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to shorten url' })
        };
    }}
    return {
        statusCode: 404,
        body: JSON.stringify({ error: "Not Found" }),
      };
};