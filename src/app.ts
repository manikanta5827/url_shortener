import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getShortUrl } from "./service/get_short_url";
import { getOriginalUrl } from "./service/get_original_url";
import { getShortUrlRequestBody } from "./types/url_shortener.types";
import { sendResponse } from "./utilities/response_constructor";

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const path = event.requestContext.resourcePath;
    const method = event.requestContext.httpMethod;

    // if (method === "OPTIONS") {
    //   return {
    //     statusCode: 200,
    //     headers: {
    //       "Access-Control-Allow-Origin": "*",
    //       "Access-Control-Allow-Headers": "Content-Type,Authorization",
    //       "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
    //     },
    //     body: "",
    //   };
    // }

    // get short url
    if (path === "/get-short-url" && method === "POST") {
      const body: getShortUrlRequestBody = event.isBase64Encoded
        ? JSON.parse(
            Buffer.from(event.body as string, "base64").toString("utf8")
          )
        : JSON.parse(event.body as string);

      // get the url from body
      const url = body.url;

      if (!url) {
        return sendResponse(400, {
          status: "error",
          message: "url is required",
        });
      }

      // pass it to getShortUrl fn
      const response = await getShortUrl(url);

      // check the responses
      if (response.statusCode > 201) {
        return sendResponse(response.statusCode, {
          status: response.status,
          message: response.message,
        });
      }

      const shortUrl = `https://${event.requestContext.domainName}/${event.requestContext.stage}/get-original-url/${response.message}`;
      return sendResponse(response.statusCode, {
        status: "success",
        short_url: shortUrl,
      });
    }
    // get long url
    else if (path === "/get-original-url/{id}" && method === "GET") {
      const id = event.pathParameters?.id as string;

      if (!id) {
        return sendResponse(400, {
          status: "error",
          message: "id is required",
        });
      }

      const response = await getOriginalUrl(id);

      // check the responses
      if (response.statusCode > 200) {
        return sendResponse(response.statusCode, {
          status: response.status,
          message: response.message,
        });
      }

      return {
        statusCode: 301,
        body: "",
        headers: {
          Location: response.message,
        },
      };
    }
    // if path is not matched return 404
    return sendResponse(404, { status: "failed", message: "route not found" });
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Something went wrong",
        error: err instanceof Error ? err.message : "empty error message",
        event,
      }),
    };
  }
};
