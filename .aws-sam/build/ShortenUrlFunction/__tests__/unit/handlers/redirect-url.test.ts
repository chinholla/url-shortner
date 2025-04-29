import { handler } from '../../../src/handlers/short-url.mts';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
const ddbMock = mockClient(DynamoDBClient);
const mockItem = { id: /[a-zA-Z0-9.-]/i, longUrl: 'https://example.com' };
beforeEach(() => {
  ddbMock.reset();
  process.env.TABLE_NAME = 'url-shortner';
});
describe('GET /{shortId}', () => {
  it('should return 403 for missing shortId', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/',
      pathParameters: null
    };
    const result = await handler(event as any);
    expect(result.statusCode).toBe(403);
    expect(JSON.parse(result.body).error).toMatch(/Missing Authentication Token/);
  });
  it('should return 404 for non-existent shortId', async () => {
    ddbMock.on(GetCommand).resolves({});    
    const event = {
      httpMethod: 'GET',
      path: '/',
      pathParameters: { shortId: 'nonexistent' }
    };
    const result = await handler(event as any);
    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).error).toMatch(/URL not found/);
  });
  it('should redirect for valid shortId', async () => {
    ddbMock.on(GetCommand).resolves({ Item: mockItem });
    const event = {
      httpMethod: 'GET',
      path: `/${mockItem.id}`,
      pathParameters: { shortId: mockItem.id },
      headers: {}
    };
    const result = await handler(event as any);
    expect(result.statusCode).toBe(301);
    expect(result.headers?.Location).toBe(mockItem.longUrl);
  });
  it('it should return 500 on DynamoDB error', async () => {
    ddbMock.on(GetCommand).rejects(new Error('DynamoDB error'));
    const event = {
      httpMethod: 'GET',
      path: `/${mockItem.id}`,
      pathParameters: { shortId: mockItem.id }
    };
    const result = await handler(event as any);
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toMatch(/Internal server error/);
  });
});