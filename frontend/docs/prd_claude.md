# PRD — Dhaka Tesla Pool
### Ride-Pooling MVP | Backend-First Implementation Guide

**Cast (used consistently across seed data, tests, demo):**
Jashim (driver) · Bullet (Tesla, 3-seat capacity) · Nusrat, Rafiq, Shirin (passengers)

**Build order:** Backend fully complete (API, DB, auth, business logic, tests) → then Frontend.
This PRD is written in that order — implement top to bottom.

---

## 1. Tech Stack & Justification

| Layer | Choice | Why it fits this MVP | What would make me switch |
|---|---|---|---|
| Frontend | **Next.js (App Router)** | File-based routing fits passenger/driver dashboards cleanly; SSR for the landing/login pages; can move to API routes later if backend needs a BFF layer | If we needed a pure SPA/mobile-first shell, plain React + Vite would be leaner |
| Backend | **NestJS** | Opinionated modular structure (modules/controllers/services) maps 1:1 onto domain concepts (Auth, Rides, Pools, Teslas) — enforces separation the brief explicitly scores on; built-in DI makes testing services easy; guards/pipes give clean auth + validation | Fastify/Express if the team wanted something leaner with less ceremony for a tiny service |
| Database | **PostgreSQL** | Relational integrity matters here — seat capacity, FK constraints, transactions for the concurrency problem (Section 14) need real ACID guarantees; JSON columns available if needed later | SQLite only if this were a pure local demo with no concurrency requirement |
| ORM | **Prisma** | Type-safe queries, migrations out of the box, schema-as-single-source-of-truth is easy to explain in an interview, `$transaction` API is a clean fit for the seat-locking problem | TypeORM if deeper NestJS-native decorator patterns were needed; raw SQL if Prisma's transaction isolation control proved insufficient |
| Auth | **JWT (access + refresh token pattern)** | Stateless access tokens work well for a decoupled Next.js frontend calling a separate NestJS API; refresh tokens stored hashed in DB so they can be revoked | Session cookies + Redis store if this became a single-domain monolith needing instant revocation |
| Validation | **class-validator + class-transformer** (NestJS native) | DTO-based validation is idiomatic Nest, pairs with Swagger decorators | zod if the team preferred schema-first validation shared with frontend |
| Testing | **Jest** (Nest default) + **Supertest** for e2e | Ships with Nest CLI, no extra setup cost | — |
| API style | **REST** | Resource-oriented (users, rides, pools, teslas) maps cleanly to CRUD + state-transition endpoints; simpler to demo/test with curl/Postman than GraphQL for a 5-entity MVP | GraphQL if the frontend needed flexible nested queries across many clients |
| Hosting | **Docker Compose locally**, free-tier deploy (Render/Railway) for API + Neon/Supabase free Postgres for DB, Vercel free tier for Next.js frontend | Zero cost, reproducible | — |

---

## 2. Domain Decisions (documented assumptions — Section 17)

1. **Users table is unified** with a `role` enum (`PASSENGER` / `DRIVER`). A driver additionally owns exactly one `Tesla` (1:1 for MVP — a driver doesn't swap vehicles mid-challenge). *Why:* avoids duplicating auth logic across two tables; role-based guards handle the split cleanly.
2. **A `RideRequest` belongs to at most one `Pool`.** A `Pool` is created the moment the first request is matched, and up to `capacity` seats worth of additional requests can join it while it's still `MATCHED`/pre-`STARTED`. *Why:* keeps pooling as an attribute of the ride rather than a separate heavyweight entity.
3. **Matching rule (documented, Section 4):** two ride requests are poolable if `pickupZone` is identical **and** their `destinationZone`s belong to the same predefined `zoneGroup` (e.g., Banani, Gulshan 1, Gulshan 2, Mohakhali are all in `zoneGroup: GULSHAN_BANANI_MOHAKHALI`). Nusrat (→Mohakhali) and Rafiq (→Gulshan 1) match under this rule. Exact-same-destination is *not* required — that's the whole point of "compatible routes."
4. **Cancellation is allowed only while status is `REQUESTED` or `MATCHED`.** Once `DRIVER_ARRIVED` or later, cancellation is blocked (driver already committed). *Why:* matches real-world rider apps and gives a clean, testable rule.
5. **Fare fields are embedded directly on `RideRequest`** (`baseFare`, `distanceCharge`, `poolDiscount`, `totalFare`) rather than a separate `Fare` table, since each ride request has exactly one fare and no fare history is needed for MVP. A separate `Payment` table exists for the payment method/status, since that's a distinct concern (cash settled later vs wallet settled instantly).
6. **Money stored as integer paisa** (1 BDT = 100 paisa) in all fare/payment columns. *Why:* avoids floating-point rounding errors in fare math; convert to decimal only at the presentation layer.
7. **Zones are a fixed seed table**, not free text — `Banani, Gulshan 1, Gulshan 2, Mohakhali, Dhanmondi, Mirpur, Uttara, Farmgate, Bashundhara`. Each zone has a `zoneGroup` used by the matching rule.

---

## 3. Fare Model (hand-calculable)

```
passengerFare = baseFare + (distanceCharge_per_km * estimatedKm) - poolDiscount
```

- `baseFare` = 30 BDT (3000 paisa) — flat, fixed per zone-pair lookup (no live routing)
- `distanceCharge_per_km` = 15 BDT/km (1500 paisa) — `estimatedKm` comes from a static zone-to-zone distance table (seeded, not calculated)
- `poolDiscount` = 20% of (`baseFare` + `distanceCharge`) **applied only if the ride is part of a pool with ≥2 passengers**

**Worked example — Nusrat & Rafiq (documented in README, testable by hand):**

| | Nusrat (Banani→Mohakhali, 4km) | Rafiq (Banani→Gulshan 1, 3km) |
|---|---|---|
| baseFare | 3000 paisa | 3000 paisa |
| distanceCharge | 4 × 1500 = 6000 paisa | 3 × 1500 = 4500 paisa |
| subtotal | 9000 paisa | 7500 paisa |
| poolDiscount (20%) | 1800 paisa | 1500 paisa |
| **totalFare** | **7200 paisa (72 BDT)** | **6000 paisa (60 BDT)** |

Shirin, riding solo (no pool match) pays full `baseFare + distanceCharge` with **no discount**.

Payment: `method` = `CASH` or `TESLAPAY` (simulated wallet balance on the `User` row, debited on `COMPLETED`).

---

## 4. Ride Lifecycle

```
REQUESTED → MATCHED → DRIVER_ARRIVED → STARTED → COMPLETED
                ↘ CANCELLED (only from REQUESTED or MATCHED)
```

| Transition | Triggered by | Guard |
|---|---|---|
| `REQUESTED` → `MATCHED` | Driver accepts request (solo or into existing pool) | Tesla must be online, capacity available |
| `MATCHED` → `DRIVER_ARRIVED` | Driver | Ride must belong to this driver's active pool |
| `DRIVER_ARRIVED` → `STARTED` | Driver | Pool must have ≥1 passenger |
| `STARTED` → `COMPLETED` | Driver | — |
| `REQUESTED`/`MATCHED` → `CANCELLED` | Passenger (own ride only) or Driver | Blocked once `DRIVER_ARRIVED`+ |

Every transition is written to `RideStatusHistory` (append-only audit log).

---

## 5. Database Schema (PostgreSQL + Prisma)

```prisma
// schema.prisma

enum UserRole {
  PASSENGER
  DRIVER
}

enum RideStatus {
  REQUESTED
  MATCHED
  DRIVER_ARRIVED
  STARTED
  COMPLETED
  CANCELLED
}

enum PoolStatus {
  OPEN        // accepting more passengers
  LOCKED      // driver started trip, no more joins
  COMPLETED
  CANCELLED
}

enum PaymentMethod {
  CASH
  TESLAPAY
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
}

enum ZoneGroup {
  GULSHAN_BANANI_MOHAKHALI
  DHANMONDI_FARMGATE
  MIRPUR
  UTTARA
  BASHUNDHARA
}

model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  passwordHash  String
  phone         String?
  role          UserRole
  walletBalance Int       @default(0)   // paisa, for TESLAPAY
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  tesla         Tesla?                  // 1:1, only if role = DRIVER
  rideRequests  RideRequest[]           // only if role = PASSENGER
  refreshTokens RefreshToken[]

  @@index([role])
}

model RefreshToken {
  id        String   @id @default(uuid())
  tokenHash String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  revoked   Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId])
}

model Zone {
  id        String    @id @default(uuid())
  name      String    @unique          // "Banani", "Gulshan 1", ...
  group     ZoneGroup

  pickupRides      RideRequest[] @relation("PickupZone")
  destinationRides RideRequest[] @relation("DestinationZone")

  @@index([group])
}

model ZoneDistance {
  id            String @id @default(uuid())
  fromZoneId    String
  toZoneId      String
  distanceKm    Float

  @@unique([fromZoneId, toZoneId])
}

model Tesla {
  id         String   @id @default(uuid())
  plateNo    String   @unique
  model      String   @default("Bullet")
  capacity   Int      @default(3)
  isOnline   Boolean  @default(false)
  driverId   String   @unique
  driver     User     @relation(fields: [driverId], references: [id], onDelete: Cascade)

  pools      Pool[]

  @@index([isOnline])
}

model Pool {
  id           String     @id @default(uuid())
  teslaId      String
  tesla        Tesla      @relation(fields: [teslaId], references: [id])
  status       PoolStatus @default(OPEN)
  seatsFilled  Int        @default(0)   // denormalized counter, updated in same transaction as membership insert
  createdAt    DateTime   @default(now())
  startedAt    DateTime?
  completedAt  DateTime?

  rideRequests RideRequest[]

  @@index([teslaId, status])
}

model RideRequest {
  id                String     @id @default(uuid())
  passengerId       String
  passenger         User       @relation(fields: [passengerId], references: [id])

  pickupZoneId      String
  pickupZone        Zone       @relation("PickupZone", fields: [pickupZoneId], references: [id])
  destinationZoneId String
  destinationZone   Zone       @relation("DestinationZone", fields: [destinationZoneId], references: [id])

  seatsRequested    Int        @default(1)
  status            RideStatus @default(REQUESTED)

  poolId            String?
  pool              Pool?      @relation(fields: [poolId], references: [id])

  baseFare          Int        // paisa
  distanceCharge    Int        // paisa
  poolDiscount      Int        @default(0)
  totalFare         Int        // paisa

  requestedAt       DateTime   @default(now())
  matchedAt         DateTime?
  cancelledAt       DateTime?
  completedAt       DateTime?

  statusHistory     RideStatusHistory[]
  payment           Payment?

  @@index([status])
  @@index([passengerId])
  @@index([poolId])
  @@index([pickupZoneId, destinationZoneId])
}

model RideStatusHistory {
  id            String     @id @default(uuid())
  rideRequestId String
  rideRequest   RideRequest @relation(fields: [rideRequestId], references: [id], onDelete: Cascade)
  fromStatus    RideStatus?
  toStatus      RideStatus
  changedByUserId String
  changedAt     DateTime   @default(now())

  @@index([rideRequestId])
}

model Payment {
  id            String        @id @default(uuid())
  rideRequestId String        @unique
  rideRequest   RideRequest   @relation(fields: [rideRequestId], references: [id])
  method        PaymentMethod
  status        PaymentStatus @default(PENDING)
  amount        Int           // paisa, mirrors totalFare
  paidAt        DateTime?

  @@index([status])
}
```

**Indexing rationale:**
- `RideRequest.status` — every dashboard query filters by status (driver's incoming requests, passenger's active ride)
- `RideRequest.pickupZoneId, destinationZoneId` (composite) — matching-rule lookups scan by zone pair
- `Pool.teslaId, status` — "does this Tesla have an OPEN pool right now" is the hot query for pooling + the concurrency check
- `Tesla.isOnline` — driver-availability queries
- `RefreshToken.userId` — token lookups/revocation on logout
- Unique constraints: `Tesla.driverId` (1:1), `Payment.rideRequestId` (1:1), `ZoneDistance.[fromZoneId, toZoneId]`

---

## 6. Concurrency Handling (Bullet's Last Seat)

**Scenario:** Bullet has 1 seat left in an `OPEN` pool. Nusrat and Shirin both call `POST /rides/:id/join-pool` (or get matched) within milliseconds.

**Approach:** Wrap the seat-claim in a single Prisma `$transaction` using a **row-level lock** on the `Pool` row:

```ts
await prisma.$transaction(async (tx) => {
  const pool = await tx.pool.findUnique({
    where: { id: poolId },
    // raw query used here for SELECT ... FOR UPDATE, since Prisma
    // doesn't expose row locking directly — documented trade-off
  });
  // re-check seatsFilled + capacity INSIDE the transaction, after the lock
  if (pool.seatsFilled + seatsRequested > tesla.capacity) {
    throw new ConflictException('No seats available');
  }
  await tx.pool.update({
    where: { id: poolId },
    data: { seatsFilled: { increment: seatsRequested } },
  });
  await tx.rideRequest.update({ where: { id: rideRequestId }, data: { poolId, status: 'MATCHED' } });
}, { isolationLevel: 'Serializable' });
```

Whichever request's transaction commits first wins; the second re-checks capacity inside its own transaction and fails cleanly with `409 Conflict`. Serializable isolation (or `SELECT ... FOR UPDATE` via `$queryRaw`) prevents both transactions from reading the stale `seatsFilled` value simultaneously.

**At scale:** move seat reservation to a distributed lock (Redis `SETNX`/Redlock) or a queue-based matcher that serializes all claims for a given Tesla through one worker, instead of relying on DB row locks under high contention.

**Test to write:** fire two concurrent `join-pool` calls for the same last seat in a test using `Promise.all`, assert exactly one `200` and one `409`, and assert `seatsFilled` never exceeds `capacity`.

---

## 7. Folder Structure

```
dhaka-tesla-pool/
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── common/
│   │   │   ├── decorators/          # @CurrentUser(), @Roles()
│   │   │   ├── filters/             # global HttpExceptionFilter
│   │   │   ├── guards/              # JwtAuthGuard, RolesGuard
│   │   │   ├── interceptors/        # logging, response-shaping
│   │   │   └── pipes/               # ValidationPipe config
│   │   ├── config/
│   │   │   ├── configuration.ts
│   │   │   └── validation.schema.ts # env var validation
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── strategies/      # jwt.strategy.ts, jwt-refresh.strategy.ts
│   │   │   │   └── dto/             # register.dto.ts, login.dto.ts
│   │   │   ├── users/
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── users.module.ts
│   │   │   │   └── dto/
│   │   │   ├── teslas/
│   │   │   │   ├── teslas.controller.ts
│   │   │   │   ├── teslas.service.ts
│   │   │   │   ├── teslas.module.ts
│   │   │   │   └── dto/
│   │   │   ├── zones/
│   │   │   │   ├── zones.controller.ts
│   │   │   │   ├── zones.service.ts
│   │   │   │   └── zones.module.ts
│   │   │   ├── rides/
│   │   │   │   ├── rides.controller.ts
│   │   │   │   ├── rides.service.ts
│   │   │   │   ├── rides.module.ts
│   │   │   │   ├── dto/             # create-ride.dto.ts, transition.dto.ts
│   │   │   │   └── state-machine/   # ride-status.transitions.ts
│   │   │   ├── pools/
│   │   │   │   ├── pools.controller.ts
│   │   │   │   ├── pools.service.ts # matching rule + capacity/lock logic
│   │   │   │   └── pools.module.ts
│   │   │   ├── fares/
│   │   │   │   └── fares.service.ts # pure fare-calculation logic, unit-testable
│   │   │   └── payments/
│   │   │       ├── payments.controller.ts
│   │   │       ├── payments.service.ts
│   │   │       └── payments.module.ts
│   │   └── seed/
│   │       └── seed.ts              # Jashim/Bullet/Nusrat/Rafiq/Shirin
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── test/
│   │   ├── unit/                    # fares.service.spec.ts, pools.service.spec.ts
│   │   └── e2e/                     # rides.e2e-spec.ts, concurrency.e2e-spec.ts
│   ├── .env.example
│   ├── Dockerfile
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (passenger)/
│   │   │   │   ├── request-ride/page.tsx
│   │   │   │   ├── ride/[id]/page.tsx
│   │   │   │   └── history/page.tsx
│   │   │   ├── (driver)/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── pool/[id]/page.tsx
│   │   │   │   └── history/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                  # buttons, cards, status badges
│   │   │   ├── ride/                # RideStatusTracker, FareBreakdown
│   │   │   └── driver/              # PoolPassengerList, SeatGauge
│   │   ├── lib/
│   │   │   ├── api-client.ts        # fetch wrapper, attaches JWT
│   │   │   ├── auth.ts              # token storage/refresh logic
│   │   │   └── types.ts             # shared API response types
│   │   ├── hooks/
│   │   │   ├── useRideStatus.ts
│   │   │   └── useAuth.ts
│   │   └── store/                   # zustand/context for auth + active ride
│   ├── public/
│   ├── .env.example
│   ├── Dockerfile
│   ├── next.config.js
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml
├── .gitignore
├── README.md
└── prd.md
```

---

## 8. Features — Implementation Order with Endpoints, Edge Cases, Responses

> Build strictly in this order. Each feature should be its own `feature/*` branch, tested, then merged to `master`.

### 8.1 `feature/setup` — Project scaffolding
- NestJS project init, Prisma init, PostgreSQL via Docker Compose, `.env.example`
- Global `ValidationPipe`, `HttpExceptionFilter`, logging interceptor
- **Done when:** `docker compose up` boots API + DB, `GET /health` returns `200`

### 8.2 `feature/schema` — DB schema + seed
- Write `schema.prisma` per Section 5, run first migration
- Seed script creates: Jashim (driver), Bullet (Tesla, capacity 3), Nusrat/Rafiq/Shirin (passengers), 9 Dhaka zones with groups, zone-distance table
- **Done when:** `prisma migrate dev` + `prisma db seed` run clean from a fresh container

### 8.3 `feature/passenger-auth` — Auth module
**Endpoints:**
- `POST /auth/register` — `{ name, email, password, role }`
- `POST /auth/login` — `{ email, password }` → `{ accessToken, refreshToken, user }`
- `POST /auth/refresh` — `{ refreshToken }` → new `accessToken`
- `POST /auth/logout` — revokes refresh token

**Edge cases:**
- Duplicate email → `409 Conflict` `{ error: "EMAIL_TAKEN" }`
- Wrong password → `401 Unauthorized` `{ error: "INVALID_CREDENTIALS" }` (never reveal which field is wrong)
- Expired/revoked refresh token → `401` `{ error: "REFRESH_INVALID" }`
- Password under 8 chars → `400` validation error with field-level detail

**Success response shape:**
```json
{ "accessToken": "...", "refreshToken": "...", "user": { "id": "...", "name": "Nusrat", "role": "PASSENGER" } }
```

### 8.4 `feature/driver-onboarding` — Users + Teslas module
- Drivers are pre-seeded with an associated Tesla (documented assumption #1); no public driver self-registration in MVP
- `PATCH /teslas/me/status` — `{ isOnline: boolean }` (driver only, `RolesGuard`)
- `GET /teslas/me` — driver views own Tesla + capacity

**Edge case:** passenger calling `/teslas/me` → `403 Forbidden` `{ error: "ROLE_NOT_ALLOWED" }`

### 8.5 `feature/zones` — Zones module
- `GET /zones` → list of 9 zones with groups (frontend dropdown source)
- Seeded, read-only in MVP; no create/update endpoints needed

### 8.6 `feature/ride-request` — Ride creation (solo, no pooling yet)
**Endpoint:** `POST /rides`
```json
{ "pickupZoneId": "...", "destinationZoneId": "...", "seatsRequested": 1 }
```
- Server computes `baseFare`, `distanceCharge` from `ZoneDistance`, `totalFare` (no discount yet, solo)
- Status set to `REQUESTED`, `RideStatusHistory` row written

**Edge cases:**
- No online Tesla with capacity anywhere → still create as `REQUESTED` (matching happens async/on-demand, not blocking) — document this as MVP simplification
- `seatsRequested` > Tesla's max capacity (3) → `400` `{ error: "SEATS_EXCEED_MAX_CAPACITY" }`
- Passenger already has an active (`REQUESTED`/`MATCHED`/`DRIVER_ARRIVED`/`STARTED`) ride → `409` `{ error: "ACTIVE_RIDE_EXISTS" }`
- Same zone for pickup and destination → `400` `{ error: "INVALID_ROUTE" }`

**Response:**
```json
{ "id": "...", "status": "REQUESTED", "baseFare": 3000, "distanceCharge": 6000, "totalFare": 9000 }
```

### 8.7 `feature/ride-status-tracking` — Passenger status/history endpoints
- `GET /rides/:id` — own ride only (ownership check: `403` if not owner)
- `GET /rides/history` — passenger's own past rides, paginated
- `PATCH /rides/:id/cancel` — passenger cancels own ride

**Edge cases:**
- Cancel after `DRIVER_ARRIVED` → `400` `{ error: "CANCELLATION_WINDOW_CLOSED" }`
- Cancel someone else's ride → `403` `{ error: "NOT_YOUR_RIDE" }`
- Cancel already-`COMPLETED`/`CANCELLED` ride → `400` `{ error: "INVALID_STATE_FOR_CANCEL" }`

### 8.8 `feature/tesla-pooling` — Matching rule + Pools module (core feature)
**Endpoint:** `GET /pools/matchable-requests` — driver sees `REQUESTED` rides matching their current `OPEN` pool (or matchable to start a new one) under the zone-group rule from Section 2.3

**Endpoint:** `POST /rides/:id/accept` — driver accepts a request
- If no `OPEN` pool exists for this Tesla → creates one, sets ride to `MATCHED`
- If an `OPEN` pool exists and the new request matches the rule **and** capacity allows → joins existing pool
- If capacity full → `409` `{ error: "POOL_AT_CAPACITY" }`
- If zones don't satisfy matching rule → `400` `{ error: "ROUTE_NOT_COMPATIBLE" }`

**Recompute fares on join:** when a second passenger joins, recalculate `poolDiscount` for **all** members of that pool (Nusrat's fare drops once Rafiq joins) — write updated `totalFare` for each `RideRequest` in the same transaction.

**Edge case — the concurrency problem:** implemented per Section 6, tested with concurrent requests.

### 8.9 `feature/driver-trip-flow` — Lifecycle transitions
- `PATCH /rides/:id/arrived` (driver) → `DRIVER_ARRIVED`, locks the pool (`status: LOCKED`, no more joins)
- `PATCH /rides/:id/start` (driver) → `STARTED` for all rides in the pool
- `PATCH /rides/:id/complete` (driver) → `COMPLETED` for all rides in the pool, triggers payment settlement

**Edge cases:**
- Any transition attempted out of order (e.g., `start` before `arrived`) → `400` `{ error: "INVALID_TRANSITION", from: "MATCHED", attempted: "STARTED" }`
- Driver tries to transition a ride not in their own pool → `403`

### 8.10 `feature/payments` — Payment settlement
- `Payment` row created (`PENDING`) when ride reaches `MATCHED`
- On `COMPLETED`: if `TESLAPAY`, debit `walletBalance` in the same transaction, set `Payment.status = PAID`; if `CASH`, mark `PAID` immediately (assumed settled with driver)
- **Edge case:** insufficient wallet balance for `TESLAPAY` → ride still completes (documented assumption: fare settlement failure doesn't block trip completion in MVP), `Payment.status = FAILED`, surfaced to passenger

### 8.11 `feature/driver-dashboard-data` — Driver views
- `GET /pools/active` — driver's current pool with all passengers, seats, per-passenger fare, status
- `GET /pools/history` — driver's completed pools

### 8.12 `feature/tests` — Testing pass
Per Section 12 of the brief:
- Unit: `fares.service.spec.ts` (Nusrat/Rafiq numbers exactly), `pools.service.spec.ts` (capacity, matching rule)
- e2e: invalid transitions rejected, ownership enforced (passenger A can't see/cancel passenger B's ride), cancellation window enforced, **concurrency test** (Section 6)

### 8.13 `feature/docker-deploy`
- `docker-compose.yml`: `api`, `db` (postgres), healthchecks, volume for DB persistence
- Backend `Dockerfile` (multi-stage: build → slim runtime)
- Deploy API + DB free-tier, note URL in README

---

## 9. Frontend (after backend is fully complete and tested)

Build order mirrors backend modules:
1. Auth pages (login/register) + token storage/refresh in `lib/auth.ts`
2. Passenger: request-ride form (zone dropdowns from `GET /zones`) → fare estimate preview → submit
3. Passenger: ride status tracker page (poll `GET /rides/:id` every few seconds) with clear state UI for each lifecycle stage
4. Passenger: history page
5. Driver: dashboard — online/offline toggle, incoming matchable requests, accept/pool action
6. Driver: active pool view — seat gauge (e.g., "2/3 seats"), passenger list with individual fares, arrived/start/complete buttons
7. Driver: history page
8. Global: loading/error/empty states for every fetch, 401 handling → redirect to login + silent refresh attempt first

---

## 10. What Else to Set Up Before Writing Feature Code

- [ ] Root `docker-compose.yml` wiring `backend`, `frontend`, `db` services with a shared network
- [ ] `.env.example` in both `backend/` and `frontend/` (DB URL, JWT secrets, JWT expiry, `NEXT_PUBLIC_API_URL`)
- [ ] ESLint + Prettier configs in both projects (consistent formatting matters for review)
- [ ] `.gitignore` covering `node_modules`, `.env`, `dist`, `.next`
- [ ] GitHub repo with branch protection-style discipline: `master`, `pre-release`, `release/v1.0.0`, `feature/*`
- [ ] Swagger/OpenAPI setup in NestJS (`@nestjs/swagger`) — free documentation of every endpoint as you build, useful for the video and for the frontend integration
- [ ] Seed script idempotency — running it twice shouldn't duplicate Jashim/Bullet/Nusrat/Rafiq/Shirin (upsert by unique email/plate)
- [ ] A `docs/` folder for the architecture diagram (Mermaid) and ERD, referenced from `README.md`
- [ ] Postman/Thunder Client collection or `*.http` file for manual endpoint testing while building, before frontend exists

---

## 11. Standard Error Response Shape (applies to every endpoint)

```json
{
  "statusCode": 409,
  "error": "POOL_AT_CAPACITY",
  "message": "This Tesla's pool is already full.",
  "timestamp": "2026-09-28T08:41:00.000Z",
  "path": "/rides/abc123/accept"
}
```
Implemented once via a global `HttpExceptionFilter` in `common/filters/` — every service throws Nest's built-in exceptions (`ConflictException`, `ForbiddenException`, `BadRequestException`, etc.) with a machine-readable `error` code in the payload, and the filter standardizes the envelope.

---

## 12. Next Step

Start at **Section 8.1**. Each numbered sub-section is one `feature/*` branch. Do not start frontend work until 8.1–8.13 are merged into `master` and passing tests.
