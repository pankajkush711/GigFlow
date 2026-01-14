## GigFlow – Mini Freelance Marketplace

GigFlow is a mini–freelance marketplace where **any user can be both Client and Freelancer**:

- **Clients** post gigs (jobs) with title, description, and budget.
- **Freelancers** browse open gigs, place bids, and can be **hired** on a specific bid.

This project is split into a **Node/Express/MongoDB backend** (`server`) and a **React (Vite) frontend** (`client`) with **Redux Toolkit** for state management and **JWT auth with HttpOnly cookies**.

---

### Tech Stack

- **Frontend**: React (Vite), Redux Toolkit, React Router
- **Styling**: Custom CSS (Tailwind-like layout), easily swappable to Tailwind
- **Backend**: Node.js, Express.js, Mongoose (MongoDB)
- **Auth**: JWT stored in **HttpOnly cookies**
- **Realtime (bonus-ready)**: Socket.io server hook for hire notifications

---

### Features Implemented

- **User Authentication**
  - Register and login with **email + password**.
  - JWT issued on login/register and stored in an **HttpOnly cookie**.
  - No hard roles – any logged-in user can act as **Client or Freelancer**.

- **Gig Management**
  - Browse all **open** gigs on the home page.
  - **Search by title** using a search box (server-side filter).
  - **Post Gig** form for logged-in users: Title, Description, Budget.
  - Gigs are stored with `status` = `open` or `assigned`.

- **Bidding & Hiring (Core Logic)**
  - Any logged-in user can **submit a bid** (message + price) on an open gig.
  - The **gig owner** can:
    - View all bids for their gig.
    - Click **Hire** on exactly one bid.
  - Hire logic (backend):
    - Gig `status` changes from `open` → `assigned`.
    - Selected bid `status` becomes `hired`.
    - All other `pending` bids on the same gig are automatically `rejected`.
  - Logic is written to prevent double-hire even under race conditions by using **conditional atomic updates** (`findOneAndUpdate` on `status` and `updateMany` for others).

---

### Project Structure

- `server/`
  - `index.js` – Express app, Mongo connection, Socket.io server.
  - `models/User.js` – User schema with password hashing and comparison.
  - `models/Gig.js` – Gig schema (`title`, `description`, `budget`, `ownerId`, `status`).
  - `models/Bid.js` – Bid schema (`gigId`, `freelancerId`, `message`, `price`, `status`).
  - `routes/auth.js` – `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`.
  - `routes/gigs.js` – `/api/gigs` (GET open gigs + search, POST create gig).
  - `routes/bids.js` – `/api/bids` (POST create bid), `/api/bids/:gigId` (GET bids for owner), `/api/bids/:bidId/hire` (hire logic).

- `client/`
  - `src/api.js` – Axios instance with `baseURL` and `withCredentials`.
  - `src/store.js` – Redux store combining auth, gigs, bids slices.
  - `src/store/authSlice.js` – Auth state + login/register/logout thunks.
  - `src/store/gigsSlice.js` – Gigs list, search, create thunks.
  - `src/store/bidsSlice.js` – Fetch bids, create bid, hire bid thunks.
  - `src/App.jsx` – Routes + layout.
  - `src/pages/AuthPage.jsx` – Login/Register UI.
  - `src/pages/GigsPage.jsx` – Browse & search gigs.
  - `src/pages/PostGigPage.jsx` – Post new gig form.
  - `src/pages/GigBidsPage.jsx` – Bid submission + owner’s bids list with **Hire**.
  - `src/components/ProtectedRoute.jsx` – Redirects unauthenticated users to `/auth`.

---

### Backend – Setup & Run

#### 1. Prerequisites

- Node.js (LTS)
- MongoDB running locally **OR** MongoDB Atlas connection string

#### 2. Install dependencies

```bash
cd server
npm install
```

#### 3. Environment variables

Create `server/.env` (already generated with sensible defaults, but you can edit):

```env
MONGO_URI=mongodb://127.0.0.1:27017/gigflow
JWT_SECRET=devsecret             # change for production
CLIENT_URL=http://localhost:5173
PORT=5000
```

If using MongoDB Atlas, replace `MONGO_URI` with your connection string.

#### 4. Run the backend

```bash
cd server
npm run dev
```

You should see:

- `MongoDB connected`
- `Server running on port 5000`

The API base URL (for the frontend) is: `http://localhost:5000/api`.

---

### Frontend – Setup & Run

#### 1. Install dependencies

```bash
cd client
npm install
```

#### 2. Run the dev server

```bash
cd client
npm run dev
```

Vite will print a URL, typically: `http://localhost:5173`. Open it in the browser.

---

### How to Use (Flow)

1. **Register & Login**
   - Go to `/auth` (or click **“Login / Register”** in the header).
   - Register a user (this can be your **Client**).
   - Login – an HttpOnly cookie will be set by the backend.

2. **Post a Gig (Client)**
   - While logged in as the Client, click **“Post Gig”** in the header.
   - Fill **Title**, **Description**, **Budget** and submit.
   - You are redirected to the home page, where your new gig appears under **Open Gigs**.

3. **Bid on a Gig (Freelancer)**
   - Log out, then register/login as a second user (your **Freelancer** account).
   - On the home page, click **“View & Bid”** on the gig.
   - Use the **Submit a Bid** form (message + price) and submit. Your bid now exists.

4. **Review Bids & Hire (Client)**
   - Log out, then log back in as the original Client (who owns the gig).
   - On the home page, click **“View Bids / Hire”**.
   - You see a list of all bids (name, message, price, status).
   - Click **“Hire”** on one bid:
     - The gig becomes **assigned**.
     - That bid becomes **hired**.
     - All other pending bids for the same gig become **rejected**.

---

### Notes on Concurrency / Race Conditions

- The `PATCH /api/bids/:bidId/hire` endpoint uses **conditional atomic updates**:
  - It only sets the gig to `assigned` if it is currently `open`.
  - It only sets a bid to `hired` if it is currently `pending`.
  - It then marks all other `pending` bids for that gig as `rejected`.
- This ensures that, even if two clients click **Hire** at almost the same time, at most **one** will succeed, and the other will receive an error like **“Gig already assigned”** or **“Bid is not pending”**.

---

### (Optional) Realtime Notifications

- The backend already has a **Socket.io server** hook (`notifyUserHired`) that emits a `hired` event to a connected freelancer when they are hired.
- To fully complete **Bonus 2**, you can:
  - Add a Socket.io client in the frontend.
  - Connect with `userId` from Redux auth state.
  - Listen for `hired` events and show a toast message like:
    > “You have been hired for [Project Name]!”

---

### Running Tests / Linting

- No formal tests are included for this assignment.
- You can run the frontend linter:

```bash
cd client
npm run lint
```

---

### Deployment (High-Level)

- **Backend**: host on services like Render / Railway / Heroku + MongoDB Atlas.
  - Update `CLIENT_URL` in `.env` to your deployed frontend URL.
  - Update the frontend `api.js` `baseURL` to point to your deployed backend.
- **Frontend**: build and host on Netlify / Vercel.

```bash
cd client
npm run build
```

Then deploy the `dist` folder to your hosting provider.

