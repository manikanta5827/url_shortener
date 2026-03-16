import { updateRecordUsingPrimaryKey } from "../repository/url_shortener.repository";

const SEVEN_DAYS = 7 * 24 * 60 * 60;


export const getOriginalUrl = async (id: string): Promise<{ status: string; statusCode: number; message: string }> => {
    try {
        // validate the id
        if (id.length != 5) {
            return {
                status: 'error',
                statusCode: 400,
                message: `id length is not valid ${id}`,
            };
        }

        // update the seen count for the record and increase the expiry time and return the original url
        const ttl = Math.floor(Date.now() / 1000) + SEVEN_DAYS;
        const originalUrl = await updateRecordUsingPrimaryKey(id, ttl);

        return {
            status: 'success',
            statusCode: 200,
            message: originalUrl,
        };
    } catch (error) {
        if (error instanceof Error && error.name === "ConditionalCheckFailedException") {
            console.error("Item does NOT exist. Update skipped.");
            return {
                status: 'error',
                statusCode: 404,
                message: 'URL not found'
            }
        }
        const errorMessage = error instanceof Error ? error.message : "Something went wrong in get original url fn";
        console.error(errorMessage);
        return {
            status: 'failed',
            statusCode: 500,
            message: `something happend while fetching original url`,
        };
    }
};
