import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });



/**
 * Express application instance configured with middleware for logging, CORS, and JSON parsing.
 */
const app = express();
app.use(morgan('dev')); // for logging requests and responses
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

/**
 * Base URL for the Starling Bank API endpoints.
 *
 * @type {string}
 */
const API_BASE = process.env.STARLING_API_BASE;
/**
 * URL for OAuth token endpoints used for authentication.
 *
 * @type {string}
 */
const OAUTH_URL = process.env.STARLING_OAUTH_URL;
/**
 * OAuth client ID for Starling API authentication.
 *
 * @type {string}
 */
const CLIENT_ID = process.env.STARLING_CLIENT_ID;
/**
 * OAuth client secret for Starling API authentication.
 *
 * @type {string}
 */
const CLIENT_SECRET = process.env.STARLING_CLIENT_SECRET;
/**
 * Current access token for Starling API authentication.
 *
 * @type {string}
 */
let accessToken = process.env.STARLING_ACCESS_TOKEN;
/**
 * Refresh token used to obtain new access tokens when they expire.
 *
 * @type {string}
 */
let refreshToken = process.env.STARLING_REFRESH_TOKEN;

/**
 * Refreshes the access token using the refresh token when the current access token expires.
 * Since the access token can expire in 24hours, we need to refresh it when needed
 * @async
 * @returns {string} The new access token
 * @throws {Error} If token refresh fails
 */
async function refreshAccessToken() {
 const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetch(OAUTH_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params,
  });

  const data = await res.json();

  if (!res.ok) throw new Error('Failed to refresh token');
  accessToken = data.access_token;
  refreshToken = data.refresh_token;
  return accessToken;
}

/**
 * Proxies incoming requests to the Starling Bank API, handling authentication and token refresh.
 *
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function proxyToStarling(req, res) {
  // Remove the /api/starling prefix to get the Starling endpoint
  const endpoint = req.originalUrl.replace(/^\/api\/starling/, '');
  const url = `${API_BASE}${endpoint}`;
  const method = req.method;
  let response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'KarimSheikh'
    },
    body: method === 'GET' ? undefined : JSON.stringify(req.body),
  });
  if (response.status === 401) {
    let errorBody;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = {};
    }
    // Only refresh if the error is "invalid_token" and description includes "expired"
    // I am not sure if Starling provides such detailed error info, so adjusted as needed
    if (
      errorBody.error === 'invalid_token' &&
      errorBody.error_description &&
      errorBody.error_description.toLowerCase() === 'access token has expired'
    ) {
      console.log('Access token expired, refreshing...');

      try {
        await refreshAccessToken();
        response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'User-Agent': 'KarimSheikh'
          },
          body: method === 'GET' ? undefined : JSON.stringify(req.body),
        });
      } catch (err) {
        return res.status(401).json({ error: 'Failed to refresh token', details: err.message });
      }
    } else {
      // Not an expired token, just forward the error
      return res.status(401).json(errorBody);
    }

  }

  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
    res.status(response.status).json(data);
  } else {
    data = await response.text();
    res.status(response.status).send(data);
  }
}

// This will match ALL methods and ALL routes under /api/starling/
app.use('/api/starling', proxyToStarling);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});


/**
 * Port number on which the server listens.
 *
 * @type {number}
 */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Proxy listening on port ${PORT}`));

export default app; // For testing
