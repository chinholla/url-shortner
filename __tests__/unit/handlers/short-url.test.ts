import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../../../src/handlers/short-url.mts';
const ddbMock = mockClient(DynamoDBClient);
const mockItem = { id: '1234', longUrl: 'https://example.com' };
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
            body: JSON.stringify({ longUrl: mockItem.longUrl }),
            headers: { Host: 'api.example.com' }
        };
        const result = await handler(event as any);
        expect(result.statusCode).toBe(201);
        expect(JSON.parse(result.body).shortUrl).toContain('api.example.com')
    });
    it('it should return 500 on DynamoDB error', async () => {
        ddbMock.on(PutCommand).rejects(new Error('DynamoDB error'));
        const event = {
            httpMethod: 'POST',
            path: '/shorten',
            body: JSON.stringify({ longUrl: mockItem.longUrl }),
            headers: { Host: 'api.example.com' }
        };
        const result = await handler(event as any);
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).error).toMatch(/Failed to shorten url/);
    });
})
test('it should return 404 for unsettled promise', async () => {
    const event = {
        httpMethod: 'POST',
        path: '/invalid',
        body: JSON.stringify({ longUrl: 'invalid' }),
    }
    const result = await handler(event as any);
    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).error).toMatch(/Not Found/);
});