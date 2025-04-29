import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../../../src/handlers/short-url.mts';
const ddbMock = mockClient(DynamoDBClient);
beforeEach(() => {
    ddbMock.reset();
    process.env.TABLE_NAME = 'url-shortner';
});
describe('POST /shorten', () => {
    it('it should return 400 for missing request body', async () => {
        const event = {
            httpMethod: 'POST',
            path: '/shorten',
            body: null,
        };
        const result = await handler(event as any);
        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body).error).toMatch(/Missing URL/);
    });
    it('it should create a short URL', async () => {
        ddbMock.on(PutCommand).resolves({});
        const event = {
            httpMethod: 'POST',
            path: '/shorten',
            body: JSON.stringify({ longUrl: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-hidden' }),
        };
        const result = await handler(event as any);
        expect(result.statusCode).toBe(201);
        expect(JSON.parse(result.body).shortUrl).toMatch(/[a-zA-Z0-9.-]/i)
    });
    it('it should return 500 on DynamoDB error', async () => {
        ddbMock.on(PutCommand).rejects(new Error('DynamoDB error'));
        const event = {
            httpMethod: 'POST',
            path: '/shorten',
            body: JSON.stringify({ longUrl: /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/i }),
        };
        const result = await handler(event as any);
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).error).toMatch(/Failed to shorten url/);
    });
})
// if the promise(APIGatewayProxyResult) is not resolved, return 404. write a test case for this.
it('it should return 404 for unsettled promise', async () => {
    
})