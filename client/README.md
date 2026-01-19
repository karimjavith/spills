# Spills - Client

A “round-up” feature for customers using the Starling public developer API that is available to all customers and partners.

For example, with spending of **£4.35**, **£5.20** and **£0.87**, the round-up would be **£1.58**.  
This amount should then be transferred into a savings goal, helping the customer save for future adventures.

Built with Vite, CSS Modules, and a custom Express backend proxy for secure API access.

---

## Features

- Top header bar with Starling branding and profile modal
- Fetches account info via a secure backend proxy
- Preferences displayed as slick toggle switches
- Responsive, accessible, and production-ready UI

---

## Setup

1. **Install dependencies:**

   ```sh
   npm install
   ```

2. **Configure environment variables:**
   - Create a `.env` file in the project root:
     ```
     VITE_API_BASE_URL=http://localhost:4000/api/starling
     ```
   - (Adjust the URL if your backend runs on a different port.)

3. **Start the dev server:**

   ```sh
   npm run dev
   ```

4. **Run tests:**
   ```sh
   npm run test
   ```

---

## Tech Stack

- **React + Vite**
- **CSS Modules**
- **React Testing Library & Vitest**
- **Starling API (via backend proxy)**

---

## Notes

- **Do not call the Starling API directly from the frontend.**  
  All requests go through the backend proxy for security and CORS compliance.
- For Starling API credentials, see the server README.

---

## Author

Karim Sheikh ([karimjavith@gmail.com](mailto:karimjavith@gmail.com))
