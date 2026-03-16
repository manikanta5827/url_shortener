import dbClient from '../config/dynamodb';
import { PutCommand, UpdateCommand , QueryCommand, QueryCommandOutput} from '@aws-sdk/lib-dynamodb';

const URL_SHORTNER_TABLE = process.env.URL_SHORTENER_TABLE || 'UrlShortener';

if (!URL_SHORTNER_TABLE) {
    throw new Error('URL_SHORTENER_TABLE is not passed in env');
}


export const updateRecordUsingPrimaryKey= async (id: string, ttl: number): Promise<string> => {
    try {
        const result = await dbClient.send(new UpdateCommand({
            TableName: URL_SHORTNER_TABLE,
            Key: {
                pk: id,
            },
            UpdateExpression: `SET #clicks = if_not_exists(#clicks, :zero) + :inc , #updatedAt = :updatedAt , #expiresAt = :expiresAt`,
            ExpressionAttributeNames: {
                "#clicks": "clicks",
                "#updatedAt": "updatedAt",
                "#expiresAt": "expiresAt"
            },
            ExpressionAttributeValues: {
                ':inc': 1,
                ':zero': 0,
                ':updatedAt': new Date().toISOString(),
                ':expiresAt': ttl
            },
    
            ConditionExpression: "attribute_exists(pk)",
            ReturnValues: "ALL_NEW"
        }));
    
        console.log(result.Attributes);
        const originalUrl = (result.Attributes as {gsi1pk: string}).gsi1pk;
        return originalUrl;
    } catch (error: any) {
        console.error(`Error from Dynamo DB in updateRecordUsingPrimaryKey fn ${__filename}`);
        throw error;
    }
}

export const createNewRecord= async(url: string, randomString: string, ttl: number): Promise<void> =>{
    try {
        await dbClient.send(
            new PutCommand({
                TableName: URL_SHORTNER_TABLE,
                Item: {
                    pk: randomString,
                    gsi1pk: url,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    clicks: 0,
                    expiresAt: ttl,
                },
            }),
        );
    } catch (error: any) {
        console.error(`Error from Dynamo DB in createNewRecord fn ${__filename}`);
        throw error;
    }
}

export const getRecordFromGsi = async (url: string): Promise<QueryCommandOutput> => {
    try {
        const response = await dbClient.send(
            new QueryCommand({
                TableName: URL_SHORTNER_TABLE,
                IndexName: 'GSI1',
                KeyConditionExpression: 'gsi1pk = :url',
                ExpressionAttributeValues: {
                    ':url': url,
                },
            }),
        );
        return response;
    } catch (error: any) {
        console.error(`Error from Dynamo DB in getRecordFromGsi fn ${__filename}`);
        throw error;
    }
}