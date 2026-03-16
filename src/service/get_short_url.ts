import {createNewRecord, getRecordFromGsi} from '../repository/url_shortener.repository';
import { generateRandomUUID } from '../utilities/uuid_generator';

const SEVEN_DAYS = 7 * 24 * 60 * 60;

export const getShortUrl = async (url: string): Promise<{ status: string; statusCode: number; message: string }> => {
    try {
        // validate the url
        if (!url.includes('.')) {
            return {
                status: 'error',
                statusCode: 400,
                message: `${url} is not a valid url`,
            };
        }

        // check if the short url exist in our db
        const res = await getRecordFromGsi(url);

        if (res.Items && res.Items.length > 0) {
            console.log(res.Items);
            return {
                status: 'success',
                statusCode: 200,
                message: res.Items[0].pk,
            };
        }

        // create a random string uuid
        const randomString = generateRandomUUID();

        // store it in db
        const ttl = Math.floor(Date.now() / 1000) + SEVEN_DAYS;

        await createNewRecord(url, randomString, ttl);
        console.log(`DB row inserted`);

        return {
            status: 'success',
            statusCode: 201,
            message: randomString,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
        console.log(errorMessage);
        return {
            status: 'failed',
            statusCode: 500,
            message: `something happend while generating short url`,
        };
    }
};
