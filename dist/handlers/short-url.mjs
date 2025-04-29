import ShortUniqueId from 'short-unique-id';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
const uid = new ShortUniqueId();
const docClient = new DynamoDBClient({ region: "us-east-1" });
const tableName = process.env.TABLE_NAME;
export const handler = async (event) => {
    const { path, httpMethod, body } = event;
    const id = uid.rnd();
    if (httpMethod === "POST" && path === "/shorten") {
        const { longUrl } = JSON.parse(body || "{}");
        if (!longUrl) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing URL" }),
            };
        }
        try {
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
        }
        catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to shorten url' })
            };
        }
    }
    if (httpMethod === "GET") {
        const shortId = event.pathParameters?.shortId;
        if (!shortId) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: "Missing Authentication Token" }),
            };
        }
        try {
            const result = await docClient.send(new GetCommand({
                TableName: tableName,
                Key: { id: shortId },
            }));
            if (!result.Item) {
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
        }
        catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Internal server error" }),
            };
        }
    }
    return {
        statusCode: 404,
        body: JSON.stringify({ error: "Not Found" }),
    };
};
