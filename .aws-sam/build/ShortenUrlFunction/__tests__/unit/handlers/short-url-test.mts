import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../src/handlers/short-url';