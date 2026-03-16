import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
const AWS_REGION: string = process.env.AWS_REGION || 'ap-south-1';

if (!AWS_REGION) {
    throw new Error('AWS_REGION is not passed in env');
}

const client = new DynamoDBClient({ region: AWS_REGION });
const dbClient = DynamoDBDocumentClient.from(client);

export default dbClient;
