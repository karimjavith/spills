# Spills – Server (Express Proxy)

A secure Node.js/Express proxy for Starling Bank's public API.  
Handles OAuth token refresh, CORS, and structured logging.

---

## Features

- Proxies all Starling API requests from the frontend
- Handles access token refresh using the refresh token
- Structured request and error logging (using Morgan and custom middleware)
- 404 and error handling with JSON responses

---

## Setup

1. **Install dependencies:**

   ```sh
   npm install
   ```

2. **Configure environment variables:**
   - Create a `.env` file in the project root:
     ```
     STARLING_API_BASE=https://api-sandbox.starlingbank.com/api/v2
     STARLING_OAUTH_URL=https://oauth-sandbox.starlingbank.com/token
     STARLING_CLIENT_ID=your_client_id
     STARLING_CLIENT_SECRET=your_client_secret
     STARLING_ACCESS_TOKEN=your_initial_access_token
     STARLING_REFRESH_TOKEN=your_refresh_token
     PORT=4000
     ```

3. **Start the proxy server:**

   ```sh
   npm run start:proxy
   ```

4. **Run backend tests:**
   ```sh
   npm run test:proxy
   ```

---

## Usage

- The proxy exposes all Starling API endpoints at `/api/starling/*`.
- **Example:**  
  `GET http://localhost:4000/api/starling/accounts`

---

## Security

- **Never expose your Starling API credentials or tokens to the frontend.**
- All secrets are stored in `.env` and used only on the backend.

---

## Logging

- All requests and errors are logged in structured JSON format to the console.

---

## Author

Karim Sheikh ([karimjavith@gmail.com](mailto:karimjavith@gmail.com))
