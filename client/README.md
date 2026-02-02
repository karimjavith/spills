# Spills – Client (React)

A frontend application that implements a **“round-up savings”** experience for bank customers, powered by a secure backend proxy to the Starling Bank sandbox API.

The client focuses on **clear state management**, **predictable data flow**, and **separation of concerns**, while keeping the UI intentionally simple.

---

## What Is “Round-Up”?

When a user makes card payments, each transaction is rounded up to the nearest pound.  
The difference is accumulated and transferred into a savings goal.

**Example**

| Transaction | Rounded | Round-up |
|------------|--------|----------|
| £4.35      | £5.00  | £0.65    |
| £5.20      | £6.00  | £0.80    |
| £0.87      | £1.00  | £0.13    |
| **Total**  |        | **£1.58** |

That £1.58 is transferred into a savings goal via the backend proxy.

---

## Responsibilities of the Client

The client is intentionally **thin**:

- Displays account, transaction, and savings data
- Calculates and presents round-up totals
- Triggers actions (create goal, transfer funds)
- Delegates all security-sensitive work to the backend

It **never** talks directly to the bank API.

---

## Features

- Account selection and overview
- Transaction feed with round-up calculation
- Savings goals listing and creation
- Trigger round-up transfers
- Profile / settings modal
- Preference toggles (currently static, designed to be backend-driven)

---

## Architecture Decisions

### Backend Proxy Only
All API requests go through the Express proxy.

**Why?**
- Prevents exposing credentials
- Handles OAuth token refresh server-side
- Avoids CORS complexity
- Keeps frontend logic clean and testable

---

### State Management (Redux)

- **Redux** is used for:
  - account state
  - transactions
  - savings goals
- **Local component state** is used for:
  - loading flags
  - UI errors
  - modal visibility

I intentionally avoided persisting domain data in `localStorage`.  
Redux provides a clearer mental model and keeps the UI deterministic.

> Async thunks and heavier Redux patterns were intentionally avoided to keep complexity proportional to the problem size.

---

### Preferences & Profile

The profile section includes feature toggles such as:
- round-up enabled
- savings goal enabled

These are **currently ON and disabled** to reflect how they *would* work in a production system, where preferences are typically driven by backend APIs rather than client-side state.

---

### Styling Philosophy

- Basic, readable UI
- CSS Modules for local scoping
- Focused on correctness and clarity over polish

With more time, this could be extended with:
- design tokens
- animations
- accessibility refinements

---

## Project Structure (Client)

```sh
client/
├── src/
│   ├── components/
│   ├── features/
│   ├── store/
│   ├── services/          # API calls (via proxy)
│   ├── styles/
│   └── main.tsx
├── tests/
├── index.html
├── vite.config.ts
└── README.md              # (this file)
