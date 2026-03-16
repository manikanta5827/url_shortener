import { Response } from "../types/url_shortener.types";

export function sendResponse(statusCode: number, body: object): Response {
  return {
    statusCode,
    body: JSON.stringify(body),
  };
}
