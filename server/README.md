# Spills – Server (Express Proxy)

A secure Node.js/Express proxy for a Bank's public API.  
Handles OAuth token refresh, CORS, and structured logging.

---

## Features

- Proxies all bank API requests from the frontend
- Handles access token refresh using the refresh token (automatic retry on expiry)
- Endpoints for:
  - Listing accounts (`GET /api/accounts`)
  - Listing and creating savings goals (`GET /api/savings/goals`, `POST /api/savings/goals`)
  - Fetching transactions with round-up calculation (`GET /api/transactions`)
  - Transferring to savings goals (`POST /api/savings/transfer`)
- Structured request and error logging (using Morgan and custom middleware)
- 404 and error handling with JSON responses

---

## Setup

1. **Install dependencies:**

   ```sh
   npm install
   ```

2. **Configure environment variables:**

```sh
- Create a  .env  file in the project root:
- STARLING_API_BASE=https://api-sandbox.starlingbank.com/api/v2
- STARLING_OAUTH_URL=https://oauth-sandbox.starlingbank.com/token
- STARLING_CLIENT_ID=your_client_id
- STARLING_CLIENT_SECRET=your_client_secret
- STARLING_ACCESS_TOKEN=your_initial_access_token
- STARLING_REFRESH_TOKEN=your_refresh_token
- PORT=4000
```

3. **Start the proxy server:**
   ```sh
   npm run start:proxy
   Run backend tests:
   npm run test:proxy
   ```

---

### Usage

- The proxy exposes all bank API endpoints at  /api/starling/\* .
- Custom endpoints:
  - GET /api/accounts  – List accounts
  - GET /api/savings/goals  – List savings goals
  - POST /api/savings/goals  – Create a savings goal
  - GET /api/transactions  – Get transactions with round-up calculation
  - POST /api/savings/transfer  – Transfer to a savings goal
- Example:
   GET http://localhost:4000/api/accounts 

---

### Security

Never expose your bank API credentials or tokens to the frontend.
All secrets are stored in  .env  and used only on the backend.
OAuth tokens are refreshed and managed securely by the backend.

---

### Logging

All requests and errors are logged in structured JSON format to the console.

---
