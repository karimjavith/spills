# Spills – Server (Express Proxy)

A **TypeScript-first, production-style Express proxy** for the Bank public API.

This service acts as a secure backend gateway between the frontend and Bank’s API, handling **OAuth token lifecycle**, **round-up business logic**, and **full observability** (logs, traces, context propagation).

---

## Overview

The server is responsible for:

- Securely interacting with the Bank API
- Abstracting OAuth and token refresh away from the frontend
- Providing domain-specific endpoints for accounts, transactions, and savings
- Emitting structured logs and distributed traces for debugging and analysis

The codebase is fully written in **TypeScript**, tested, and Docker-ready.

---

## Key Features

### API & Business Logic
- Secure proxy to a Bank API
- Automatic OAuth **access token refresh** with retry
- Typed API clients and responses
- Round-up calculation logic on transactions
- Savings goal creation and transfers

### Endpoints
- `GET /api/accounts` – List accounts
- `GET /api/savings/goals` – List savings goals
- `POST /api/savings/goals` – Create a savings goal
- `GET /api/transactions` – Fetch transactions with round-up calculation
- `POST /api/savings/transfer` – Transfer round-up amount to a savings goal

### Observability
- Structured logging with **Pino**
- Async request context propagation
- Distributed tracing with **OpenTelemetry**
- Trace export compatible with **Grafana Tempo**
- Request-level correlation via request IDs

### Engineering Practices
- Full TypeScript migration (no runtime JS)
- Strong typing at API and service boundaries
- Defensive error handling
- Unit and integration tests
- Docker-compatible build & runtime

---

## Project Structure (Server)

```sh
server/
├── api/                    # Express route handlers
├── services/               # Bank API integration & business logic
├── middleware/
│   └── observability/      # Logging, tracing, context propagation
├── helpers/                # Shared utilities
├── tests/                  # Unit & integration tests
├── app.ts                  # Express app (no side effects)
├── server.ts               # Server entry point
├── tsconfig.json
└── README.md               # (this file)
