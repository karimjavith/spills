# Spills – Monorepo

A full-stack implementation of a "round-up" feature for Bank customers.

This project consists of a React client and a secure Express backend proxy for the bank public developer API.

## Project Structure

```sh
├── client/ # React + Vite frontend
├── server/ # Express backend proxy for Starling API
└── README.md # (this file)
```

## Quick Start

### 1. Clone the repository

```sh
git clone <your-repo-url>
cd <your-repo-root>
```

### 2. Setup and Run the Server

See  server/README.md  for full instructions.

```sh cd server
npm install
# Configure .env as per server/README.md
npm run start:proxy
```

### 3. Setup and Run the Client

See  client/README.md  for full instructions.

```sh cd ../client
npm install
# Configure .env as per client/README.md
npm run dev
```

## Features

Frontend

- React app with Starling branding as much as possible
- Profile/Settings and savings goal management
- Transaction feed with round-up calculation
- Create and list savings goals
- Transfer round-up amounts to savings goals

Backend

- Secure proxy for Starling API
- Handles OAuth token refresh automatically when access tokens expire
- Endpoints for:
  - Listing accounts
  - Listing and creating savings goals
  - Fetching transactions with round-up calculation
  - Transferring to savings goals
  - Structured logging and error handling

## Development & Testing

Both client and server have their own README files with detailed setup and testing instructions.
Run tests in each directory:

```sh
npm run test        # client
npm run test:proxy  # server
```

## Security

Never expose your Starling API credentials or tokens to the frontend.
All secrets are stored in  .env  files and used only on the backend.
OAuth tokens are refreshed and managed securely by the backend.
