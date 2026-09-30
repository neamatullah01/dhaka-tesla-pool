# Dhaka Tesla Pool

> Share a seat. Split the fare. Survive Dhaka traffic.

**Frontend App:** [https://dhaka-tesla-pool-ten.vercel.app](https://dhaka-tesla-pool-ten.vercel.app)  
**API Documentation (Swagger):** [https://dhaka-tesla-pool-yk51.onrender.com/api/docs](https://dhaka-tesla-pool-yk51.onrender.com/api/docs)  
**Demo Video:** [Google Drive Link](https://drive.google.com/file/d/1Qh7iet4MYQukH86ZG64Gu32I34gxo89P/view?usp=drivesdk)

## 📖 Summary & Problem Statement

Dhaka Tesla Pool is a ride-pooling MVP where multiple passengers can seamlessly share a battery-powered 3-seat vehicle (a "Bullet") for their daily commute across Dhaka corridors.

**The Problem:** Coordinating shared rides without overbooking capacity.
If three separate passengers (e.g. Nusrat, Rafiq, Shirin) request rides on overlapping routes at the exact same moment, the system must definitively enforce vehicle capacity limits, prevent race conditions, accurately track each passenger's individual ride state, calculate split fares, and provide distinct dashboards for both the driver and the passengers. 

### Core Features Implemented
- **Passenger Flow:** Request a ride between predefined zones, view fare estimates, track driver arrival, and complete the ride.
- **Driver Flow:** Go online/offline, view a stream of compatible passenger requests, manage an active pool (accepting multiple passengers until the 3-seat capacity is hit), and progress passenger ride states individually.
- **Pool Management:** Strict backend capacity enforcement to guarantee a vehicle is never overbooked, even under concurrent load.
- **Authentication:** Role-based access control (RBAC) via JWTs for `DRIVER` and `PASSENGER` roles.

---

## 🏗 Architecture & Database

*(Visual diagrams are available in the `/docs` folder)*

- **Architecture Diagram:** `docs/architecture.png`
- **ERD / Database Diagram:** `docs/erd.png`

---

## 🛠 Tech Stack & Project Structure

The project is structured as a monorepo separating the frontend and backend applications.

**Frontend:**
- Next.js (App Router)
- React, Tailwind CSS, shadcn/ui
- TanStack Query (Server state / Polling)
- Zustand (Local client auth state)
- Zod & React Hook Form

**Backend:**
- NestJS (REST API)
- TypeScript
- Prisma ORM & PostgreSQL
- Passport (JWT Authentication)
- class-validator (DTO validation)

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL (if not using Docker)

### 1. Environment Variables
Both the `frontend/` and `backend/` directories contain a `.env.example` file. 
Copy them to `.env` and fill in the required values (like `DATABASE_URL` and `JWT_SECRET`).

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Local Database (Docker)
Start the PostgreSQL database using Docker Compose:
```bash
docker-compose up -d
```

### 3. Backend Setup
```bash
cd backend
npm install
npx prisma migrate dev      # Run database migrations
npx prisma db seed          # Seed the database with demo users & zones
npm run start:dev           # Start the NestJS server on http://localhost:4000
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev                 # Start the Next.js app on http://localhost:3000
```

### 5. Running Tests
To run the automated tests on the backend:
```bash
cd backend
npm run test                # Unit & Integration tests
npm run test:e2e            # End-to-End tests
```

---

## 🔑 Demo Credentials

The database is populated with the following demo users via `seed.ts`. **All passwords are `password123`**.

**Driver:**
- **Jashim:** `jashim@example.com` (Vehicle: Bullet, Capacity: 3)

**Passengers:**
- **Nusrat:** `nusrat@example.com`
- **Rafiq:** `rafiq@example.com`
- **Shirin:** `shirin@example.com`

---

## 🧠 Key Decisions & Trade-offs

- **Polling vs WebSockets:** For the MVP, we relied on TanStack Query polling instead of WebSockets. While WebSockets provide lower latency, polling vastly simplified the initial architecture and eliminated the need for a separate Redis pub/sub layer for horizontal scaling, which allowed faster iteration on the core capacity algorithms.
- **Database Transactions:** The system relies on Prisma interactive transactions and strict where-clauses for seat locking. This definitively prevents race conditions when concurrent requests attempt to claim the final seat in a pool.
- **State Management:** Redux was intentionally avoided on the frontend. We paired TanStack Query (for all API/server state) with Zustand (exclusively for local UI and authentication tokens). This kept the frontend lightweight and prevented complex boilerplate.

### Known Limitations & Next Improvements
- **Geospatial Tracking:** The current iteration uses predefined Dhaka zones and static distances. A future iteration should integrate Google Maps/Mapbox for live GPS tracking and dynamic ETA calculations.
- **Payment Gateway:** TeslaPay/Cash is simulated. A real integration with SSLCommerz or Stripe would be required for production.
- **Push Notifications:** Passengers currently rely on the app being open to see driver arrival. Firebase Cloud Messaging (FCM) should be added.

---

## 🤖 AI Usage

**Tools Used:** Cursor, Antigravity (Google Deepmind's agentic IDE assistant).

**How it was used:** 
AI was primarily used as an engineering accelerant. Antigravity was utilized to scaffold complex responsive UI layouts (like the Driver Dashboard and Cabin Gauge), implement loading skeletons, trace through React Query cache invalidation bugs, and quickly write boilerplate NestJS DTOs based on the Prisma schema.

**One Accepted Suggestion:** 
Antigravity suggested calculating a dedicated `isRedirecting` state from the `currentRide` status payload on the frontend, using it to immediately mount a full-page Skeleton loader. I accepted this because it brilliantly bypassed a Next.js router timing quirk where the "Active Ride" card would visibly flash on the screen for a split second right before the router pushed the user to the active ride page.

**One Rejected/Changed Suggestion:** 
Initially, the AI generated all the Driver Dashboard UI code inside a single massive `page.tsx` file. I rejected this monolithic approach and instructed it to break down the UI into smaller, reusable components (`DriverHeader`, `CabinGauge`, `PoolDispatch`, `RequestStream`, `TelemetryVector`, and `StatsRow`). This enforced a cleaner, more modular architecture that aligns with React best practices.

*(Note: AI tools were used to accelerate execution, but all business logic, database architectures, capacity enforcement algorithms, and state machines were strictly designed, reviewed, debugged, and owned by me.)*

