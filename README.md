# URL Shortener Service

Serverless URL shortener built with Node.js, TypeScript, AWS Lambda, API Gateway, and DynamoDB.

## Features
- Generate 5-character short URLs
- Click tracking
- 7-day auto-expiry with TTL extension
- O(1) lookups using DynamoDB GSI

## API Endpoints

**Create Short URL**
```
POST /get-short-url
{
  "url": "https://example.com/long-url"<img width="661" height="208" alt="diagram-export-11-21-2025-8_55_34-PM" src="https://github.com/user-attachments/assets/8645e4f4-1103-4f73-9c8b-15636a8ad202" />

}
```

**Get Original URL**
```
GET /get-original-url/{id}
```

## Setup
```bash
npm install
npm run build
npm run deploy
npm test
```

<img width="661" height="208" alt="diagram-export-11-21-2025-8_55_34-PM" src="https://github.com/user-attachments/assets/fe0dfb2b-316d-4a8f-bc83-e8464a0eb60c" />

