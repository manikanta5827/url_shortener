import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { lambdaHandler } from '../../app';
import { expect, describe, it } from '@jest/globals';
import { readFileSync } from 'node:fs';
import path from 'node:path';
// import { getRecordFromGsi, createNewRecord, updateRecordUsingPrimaryKey } from '../../repository/url_shortener.repository';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, GetCommand,QueryCommand,UpdateCommand , PutCommand } from "@aws-sdk/lib-dynamodb";

const ddbMock = mockClient(DynamoDBDocumentClient);
// jest.mock('../../repository/url_shortener.repository');

const getShortUrlEvent = JSON.parse(readFileSync(path.join(__dirname + '/events/get_short_url_event.json'), 'utf8'));
const getOriginalUrlEvent = JSON.parse(readFileSync(path.join(__dirname + '/events/get_original_url_event.json'), 'utf8'));

let short_url: string;

jest.mock('nanoid', () => ({
    customAlphabet: () => () => "ABCDE"
}));
  
type getShortUrlResponse = {
    status: string;
    short_url: string;
};

describe('Unit test for app handler', () => {
    it('get the short url', async () => {
        // console.log(getShortUrlEvent);

        // (getRecordFromGsi as jest.Mock).mockResolvedValue({
        //     Items: []
        // });

        // (createNewRecord as jest.Mock).mockResolvedValue({

        // });
        ddbMock.on(QueryCommand).resolves({
            Items: []
        });

        ddbMock.on(PutCommand).resolves({});
          
        const result: APIGatewayProxyResult = await lambdaHandler(getShortUrlEvent as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(201);
        console.log(result);

        const body: getShortUrlResponse = JSON.parse(result.body);
        expect(body.status).toBe('success');
        short_url = body.short_url;
    });

    it('get the short url again with status code 200', async () => {
        // (getRecordFromGsi as jest.Mock).mockResolvedValue({
        //     Items: [{pk: "ABCDE"}]
        // });

        ddbMock.on(QueryCommand).resolves({
            Items: [{pk: "ABCDE"}]
        });

        const result: APIGatewayProxyResult = await lambdaHandler(getShortUrlEvent as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(200);

        const body: getShortUrlResponse = JSON.parse(result.body);
        expect(body.status).toBe('success');
    });

    it('get the original url from short url', async()=>{

        // (updateRecordUsingPrimaryKey as jest.Mock).mockResolvedValue({
        //     originalUrl: "https://example.com"
        // })

        ddbMock.on(UpdateCommand).resolves({
            Attributes: {
                gsipk: "https://example.com"
            }
        });
        const result: APIGatewayProxyResult = await lambdaHandler(getOriginalUrlEvent as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(301);

        console.log(result);
    })
});
