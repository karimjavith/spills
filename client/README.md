# Spills – Client

A “round-up” feature for customers using the Starling public developer sandbox API.

For example, with spending of **£4.35**, **£5.20**, and **£0.87**, the round-up would be **£1.58**.  
This amount is then transferred into a savings goal, helping the customer save for future adventures.

Built with Vite, CSS Modules, and a custom Express backend proxy for secure API access.

---

## Features

- Top header bar with Starling branding and profile modal
- Fetches account info via a secure backend proxy
- Preferences displayed as toggle switches (hard disabled for now, can be made dynamic for a given backend API)

---

## Additional Notes

### Redux and Local Storage

I chose **not** to use local storage directly for persisting the account IDs, transaction IDs, or savings goals. Instead, I managed these through the Redux store. This approach gives more flexibility and control over state management compared to direct localStorage usage.  
Component-level states (such as loading, errors, etc.) still reside within the component itself, as I felt it would be overkill to use full-blown Redux (and asyncThunk) for this testing scenario. However, I am happy to consider it if the complexity grows.

---

### Why Profile Section and Account Preferences?

Having savings goal and round-up as feature toggles controlled via account preference settings gives end users more control over the application.  
For this test, I set these toggles to **ON and disabled** by default. In a production setting, these preferences would ideally be managed via a backend API.

---

### Styles & Slickness

I used basic styling for this test to focus on functionality.  
With more time, I can further refine the design and aesthetics as needed—happy to do so!

---

## Setup

1. **Install dependencies:**

   ```sh
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the project root:

   ```
   VITE_API_BASE_URL=http://localhost:4000
   ```

   (Adjust the URL if your backend runs on a different port.)

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
