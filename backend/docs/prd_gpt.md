# Dhaka Tesla Pool — Product Requirements Document (PRD)

**Document Version:** 1.0.0  
**Project Type:** Ride-pooling MVP  
**Implementation Order:** Backend first → Frontend second → Integration → Testing → Docker/Deployment → Release  
**Repository Structure:** Monorepo with separate `backend/` and `frontend/` applications

---

# 1. Product Overview

## 1.1 Product Name

**Dhaka Tesla Pool**

> Share a seat. Split the fare. Survive Dhaka traffic.

The source challenge defines a three-seat battery-powered vehicle called **Bullet**, with passengers such as **Nusrat**, **Rafiq**, and **Shirin** requesting overlapping rides from Dhaka locations. The system must determine compatible pooling, enforce capacity, calculate individual fares, maintain ride state/history, and provide separate passenger and driver flows. The challenge explicitly says real routing is not required.

The implementation in this PRD follows that requirement while making the architecture production-minded and interview-defensible. fileciteturn0file0L7-L19

---

# 2. Problem Statement

Passengers need a simple way to request rides between predefined Dhaka areas and share available vehicle capacity when routes are compatible.

The system must solve five important problems:

1. **Ride request management**
   - Passenger chooses pickup, destination, and number of seats.
   - Passenger sees an estimated fare.

2. **Pooling**
   - Multiple compatible passengers can share one Tesla/vehicle.
   - Pool capacity must never be exceeded.

3. **Individual ride tracking**
   - Each passenger has their own ride record.
   - Each passenger sees their own fare and status.

4. **Driver workflow**
   - Driver goes online/offline.
   - Driver owns a fixed-capacity vehicle.
   - Driver sees requests and accepts compatible passengers.
   - Driver marks arrival, trip start, and passenger completion.

5. **Data integrity**
   - Invalid state transitions must be rejected.
   - One passenger cannot modify another passenger's ride.
   - Concurrent requests must not overbook the vehicle.

The challenge specifically highlights capacity consistency and concurrent attempts to claim the final seat as an important engineering problem. fileciteturn0file0L125-L129

---

# 3. Goals

## 3.1 MVP Goals

The MVP must support:

- Passenger registration/login.
- Driver registration/login.
- JWT authentication.
- Role-based authorization.
- Predefined Dhaka zones.
- Driver vehicle management.
- Driver online/offline status.
- Passenger ride requests.
- Fare estimation.
- Driver request discovery.
- Pool creation.
- Pool membership.
- Route compatibility.
- Seat/capacity enforcement.
- Ride lifecycle.
- Pool lifecycle.
- Passenger cancellation.
- Driver arrival/start/completion.
- Individual passenger fare.
- Cash/simulated TeslaPay payment.
- Ride history.
- Ride status history/audit trail.
- Validation.
- Consistent error responses.
- Swagger API documentation.
- Automated tests.
- Concurrency testing.
- Docker Compose.
- Seed/demo data.
- Architecture diagram.
- ERD.
- README.
- Production-minded folder structure.

The source challenge also requires Docker setup, migrations, seed data, architecture/ERD, tests, deployment documentation, meaningful Git history, and an AI usage section. fileciteturn0file0L74-L88

---

# 4. Non-Goals

Do **not** implement these in the core MVP unless the core system is already complete:

- Google Maps integration.
- Real GPS tracking.
- Real route optimization.
- Real payment gateway.
- Real TeslaPay wallet.
- Microservices.
- Kafka.
- RabbitMQ.
- Kubernetes.
- Redis.
- Complex geospatial database.
- Dynamic surge pricing.
- Weather pricing.
- Driver ratings.
- Passenger ratings.
- Chat.
- Push notifications.
- Complex admin dashboard.

The challenge explicitly warns against adding technologies merely to make the architecture look advanced. fileciteturn0file0L90-L92

---

# 5. Recommended Technology Stack

## 5.1 Final Stack

| Layer             | Technology                          | Purpose                        |
| ----------------- | ----------------------------------- | ------------------------------ |
| Frontend          | Next.js                             | Web application                |
| UI                | React + Tailwind CSS                | UI                             |
| UI components     | shadcn/ui                           | Reusable components            |
| Data fetching     | TanStack Query                      | Server state/cache             |
| Forms             | React Hook Form                     | Form handling                  |
| Client validation | Zod                                 | Frontend validation            |
| Backend           | NestJS                              | REST API                       |
| Language          | TypeScript                          | Type safety                    |
| ORM               | Prisma                              | Database access/migrations     |
| Database          | PostgreSQL                          | Relational data + transactions |
| Authentication    | JWT + Passport                      | Authentication                 |
| Password hashing  | bcrypt                              | Secure password hashing        |
| Validation        | class-validator + class-transformer | DTO validation                 |
| Security          | Helmet + CORS + Throttler           | Basic API security             |
| Testing           | Jest + Supertest                    | Unit/integration/E2E tests     |
| Containerization  | Docker + Docker Compose             | Reproducible environment       |
| Logging           | NestJS Logger                       | Application logs               |
| Version control   | Git + GitHub                        | Source control                 |

## 5.2 Why This Stack

### Next.js

Use Next.js App Router because the challenge recommends it and it provides routing, layouts, loading states, and a clean frontend structure.

### NestJS

NestJS is the preferred backend choice for this project because:

- Modular architecture.
- Dependency injection.
- DTO validation.
- Guards.
- Interceptors.
- Exception filters.
- Swagger integration.
- Easy testing.
- Clear separation between controllers and business logic.

This project has multiple business rules around pooling, capacity, state transitions, and authorization, so NestJS modules fit the problem well.

### PostgreSQL

PostgreSQL is the primary database because the project requires:

- Relationships.
- Transactions.
- Foreign keys.
- Constraints.
- Indexes.
- Row-level locking.
- Reliable concurrent updates.

The source challenge recommends a relational database specifically because of pooling and capacity requirements. fileciteturn0file0L59-L64

### Prisma

Prisma provides:

- Type-safe database access.
- Schema-first modeling.
- Migrations.
- Seed scripts.
- Transaction support.
- Good NestJS integration.

### JWT

Use JWT for stateless access authentication.

Recommended design:

- Short-lived access token: **15 minutes**.
- Long-lived refresh token: **7 days**.
- Refresh tokens stored hashed in PostgreSQL.
- Refresh token rotation.
- Refresh token sent using an `httpOnly` cookie.
- Access token kept in frontend memory rather than localStorage.
- Logout revokes the refresh token.

Do not use NextAuth because authentication belongs to the NestJS backend in this architecture.

---

# 6. High-Level Architecture

```text
                    ┌─────────────────────┐
                    │      Browser        │
                    │ Passenger / Driver  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Next.js        │
                    │      Frontend       │
                    │   App Router        │
                    └──────────┬──────────┘
                               │ REST/JSON
                               ▼
                    ┌─────────────────────┐
                    │      NestJS API     │
                    │                     │
                    │ Auth                │
                    │ Users               │
                    │ Vehicles            │
                    │ Zones               │
                    │ Rides               │
                    │ Pools               │
                    │ Fare                │
                    │ Payments            │
                    │ Health              │
                    └──────────┬──────────┘
                               │
                         Prisma ORM
                               │
                               ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    │                     │
                    │ Users               │
                    │ Vehicles            │
                    │ Zones               │
                    │ Rides               │
                    │ Pools               │
                    │ Pool Members        │
                    │ Payments            │
                    │ Histories           │
                    └─────────────────────┘
```

---

# 7. Monorepo Structure

The repository must have two independent applications under one root:

```text
dhaka-tesla-pool/
│
├── backend/
│
├── frontend/
│
├── docs/
│   ├── architecture.md
│   ├── erd.md
│   └── decisions.md
│
├── docker-compose.yml
├── .gitignore
├── .env.example
├── README.md
└── PRD.md
```

Backend and frontend should be developed independently but integrated through REST APIs.

---

# 8. Folder Structure

```text
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

# 10. Actors

## Passenger

Can:

- Register.
- Login.
- Request a ride.
- Select pickup/destination.
- Select seats.
- See estimated fare.
- See current ride.
- See own ride status.
- Cancel when allowed.
- View history.
- View final fare.
- View payment.

## Driver

Can:

- Register/login.
- Configure vehicle.
- Go online/offline.
- View relevant requests.
- Accept requests.
- Create/join pools.
- See passengers.
- See reserved seats.
- Mark driver arrival.
- Start trip.
- Complete individual passenger rides.
- View ride history.

## System

Responsible for:

- Authentication.
- Authorization.
- Validation.
- Fare calculation.
- Route compatibility.
- Pool matching.
- Capacity enforcement.
- State transitions.
- Status history.
- Payment records.
- Data consistency.

---

# 11. Core Domain Model

The central relationship is:

```text
User
 ├── Passenger → many Rides
 └── Driver → one Vehicle

Vehicle
 └── many Pools

Pool
 └── many PoolMembers

PoolMember
 └── one Ride

Ride
 ├── one Passenger
 ├── one Pickup Zone
 ├── one Destination Zone
 ├── many StatusHistory records
 └── one Payment

Zone
 └── many ZoneRoutes
```

---

# 12. Database Design

## 12.1 Main Tables

1. users
2. refresh_tokens
3. vehicles
4. zones
5. zone_routes
6. rides
7. pools
8. pool_members
9. ride_status_history
10. payments

---

# 13. Complete Prisma Schema

Use the following as the initial database design.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ----------------------------------------------------
// ENUMS
// ----------------------------------------------------

enum UserRole {
  PASSENGER
  DRIVER
}

enum VehicleStatus {
  OFFLINE
  ONLINE
  IN_TRIP
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
  OPEN            // Accepting more passengers
  DRIVER_ARRIVED  // Driver arrived at pickup
  STARTED         // Trip locked & started; no new joins
  COMPLETED       // All passengers dropped off
  CANCELLED       // Cancelled by driver or system
}

enum PoolMemberStatus {
  WAITING
  PICKED_UP
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

enum CancellationReason {
  PASSENGER_CANCELLED
  DRIVER_CANCELLED
  NO_SEATS_AVAILABLE
}

// ----------------------------------------------------
// USERS & AUTHENTICATION
// ----------------------------------------------------

model User {
  id                 String              @id @default(uuid())
  name               String              // e.g., Jashim, Nusrat, Rafiq, Shirin
  email              String              @unique
  passwordHash       String
  phone              String?
  role               UserRole
  walletBalancePaisa Int                 @default(0) // Integer paisa for simulated TeslaPay
  isActive           Boolean             @default(true)
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

  vehicle            Vehicle?            // 1:1, populated if role = DRIVER
  rideRequests       RideRequest[]       // Populated if role = PASSENGER
  poolsAsDriver      Pool[]              @relation("DriverPools")
  statusChangesMade  RideStatusHistory[] @relation("AuditChangedBy")
  refreshTokens      RefreshToken[]

  @@index([role, isActive])
  @@map("users")
}

model RefreshToken {
  id        String    @id @default(uuid())
  tokenHash String    @unique
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())

  @@index([userId])
  @@index([expiresAt])
  @@map("refresh_tokens")
}

// ----------------------------------------------------
// VEHICLES (BULLET)
// ----------------------------------------------------

model Vehicle {
  id        String        @id @default(uuid())
  driverId  String        @unique
  driver    User          @relation(fields: [driverId], references: [id], onDelete: Restrict)
  model     String        @default("Bullet") // Jashim's 3-seat electric Tesla
  plateNo   String        @unique
  capacity  Int           @default(3)        // Fixed capacity = 3 seats
  status    VehicleStatus @default(OFFLINE)
  isActive  Boolean       @default(true)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  pools     Pool[]

  @@index([status])
  @@map("vehicles")
}

// ----------------------------------------------------
// GEOGRAPHY & DETERMINISTIC ROUTING
// ----------------------------------------------------

model Zone {
  id           String   @id @default(uuid())
  name         String   @unique // "Banani", "Gulshan 1", "Mohakhali", etc.
  corridorCode String   // e.g. "CORRIDOR_NORTH_SOUTH" to group matchable hubs
  routeOrder   Int      // Ordering along the corridor (e.g. Banani=1, Gulshan1=2, Mohakhali=3)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  pickupRides      RideRequest[]  @relation("PickupZone")
  destinationRides RideRequest[]  @relation("DestinationZone")
  distancesFrom    ZoneDistance[] @relation("FromZone")
  distancesTo      ZoneDistance[] @relation("ToZone")
  poolsStartedHere Pool[]         @relation("PoolOriginZone")

  @@index([corridorCode, routeOrder])
  @@map("zones")
}

model ZoneDistance {
  id          String   @id @default(uuid())
  fromZoneId  String
  toZoneId    String
  distanceKm  Float
  createdAt   DateTime @default(now())

  fromZone    Zone     @relation("FromZone", fields: [fromZoneId], references: [id], onDelete: Restrict)
  toZone      Zone     @relation("ToZone", fields: [toZoneId], references: [id], onDelete: Restrict)

  @@unique([fromZoneId, toZoneId])
  @@index([fromZoneId])
  @@index([toZoneId])
  @@map("zone_distances")
}

// ----------------------------------------------------
// RIDE REQUESTS (PASSENGER)
// ----------------------------------------------------

model RideRequest {
  id                  String              @id @default(uuid())
  passengerId         String
  passenger           User                @relation(fields: [passengerId], references: [id], onDelete: Restrict)

  pickupZoneId        String
  pickupZone          Zone                @relation("PickupZone", fields: [pickupZoneId], references: [id], onDelete: Restrict)
  destinationZoneId   String
  destinationZone     Zone                @relation("DestinationZone", fields: [destinationZoneId], references: [id], onDelete: Restrict)

  seatsRequested      Int                 @default(1)
  status              RideStatus          @default(REQUESTED)

  // Explicit, testable fare breakdown in Paisa (Section 5)
  baseFarePaisa       Int
  distanceFarePaisa   Int
  poolDiscountPaisa   Int                 @default(0)
  totalFarePaisa      Int

  cancellationReason  CancellationReason?
  cancellationNote    String?

  requestedAt         DateTime            @default(now())
  matchedAt           DateTime?
  driverArrivedAt     DateTime?
  startedAt           DateTime?
  completedAt         DateTime?
  cancelledAt         DateTime?

  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  poolMembership      PoolMember?
  statusHistory       RideStatusHistory[]
  payment             Payment?

  @@index([passengerId, status])
  @@index([status, pickupZoneId])
  @@index([pickupZoneId, destinationZoneId])
  @@map("ride_requests")
}

// ----------------------------------------------------
// POOL (SHARED TRIP BY JASHIM / BULLET)
// ----------------------------------------------------

model Pool {
  id               String        @id @default(uuid())
  driverId         String
  driver           User          @relation("DriverPools", fields: [driverId], references: [id], onDelete: Restrict)
  vehicleId        String
  vehicle          Vehicle       @relation(fields: [vehicleId], references: [id], onDelete: Restrict)

  originZoneId     String
  originZone       Zone          @relation("PoolOriginZone", fields: [originZoneId], references: [id], onDelete: Restrict)
  corridorCode     String        // Matches corridor of all accepted riders

  status           PoolStatus    @default(OPEN)

  // Enforces capacity <= 3. Locked in interactive transactions to handle concurrency.
  totalCapacity    Int           @default(3)
  seatsReserved    Int           @default(0)

  driverArrivedAt  DateTime?
  startedAt        DateTime?
  completedAt      DateTime?
  cancelledAt      DateTime?
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  members          PoolMember[]

  @@index([driverId, status])
  @@index([vehicleId, status])
  @@index([status, corridorCode])
  @@map("pools")
}

model PoolMember {
  id            String           @id @default(uuid())
  poolId        String
  pool          Pool             @relation(fields: [poolId], references: [id], onDelete: Restrict)
  rideRequestId String           @unique
  rideRequest   RideRequest      @relation(fields: [rideRequestId], references: [id], onDelete: Restrict)

  seatsAllocated Int             @default(1)
  status        PoolMemberStatus @default(WAITING)

  joinedAt      DateTime         @default(now())
  pickedUpAt    DateTime?
  completedAt   DateTime?
  cancelledAt   DateTime?

  @@unique([poolId, rideRequestId])
  @@index([poolId, status])
  @@map("pool_members")
}

// ----------------------------------------------------
// AUDIT & PAYMENTS
// ----------------------------------------------------

model RideStatusHistory {
  id            String       @id @default(uuid())
  rideRequestId String
  rideRequest   RideRequest  @relation(fields: [rideRequestId], references: [id], onDelete: Cascade)
  fromStatus    RideStatus?
  toStatus      RideStatus
  changedById   String?
  changedBy     User?        @relation("AuditChangedBy", fields: [changedById], references: [id], onDelete: SetNull)
  note          String?
  createdAt     DateTime     @default(now())

  @@index([rideRequestId, createdAt])
  @@map("ride_status_history")
}

model Payment {
  id                   String        @id @default(uuid())
  rideRequestId        String        @unique
  rideRequest          RideRequest   @relation(fields: [rideRequestId], references: [id], onDelete: Restrict)
  amountPaisa          Int           // Mirrors totalFarePaisa
  method               PaymentMethod @default(CASH)
  status               PaymentStatus @default(PENDING)
  transactionReference String?       @unique
  paidAt               DateTime?
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt

  @@index([status])
  @@map("payments")
}
```

---

# 14. Important Database Constraints

## 14.1 Capacity

Invariant:

```text
reservedSeats <= capacitySnapshot
```

Never trust frontend capacity values.

The backend is always responsible for enforcing capacity.

---

## 14.2 One Active Ride Per Passenger

A passenger should not be able to create multiple active rides simultaneously.

Active statuses:

```text
REQUESTED
MATCHED
DRIVER_ARRIVED
STARTED
```

Create a PostgreSQL partial unique index through a custom Prisma migration:

```sql
CREATE UNIQUE INDEX "one_active_ride_per_passenger"
ON "ride_requests" ("passengerId")
WHERE "status" IN (
  'REQUESTED',
  'MATCHED',
  'DRIVER_ARRIVED',
  'STARTED'
);
```

---

# 15. One Active Pool Per Driver/Vehicle

A driver/vehicle should not operate multiple active pools simultaneously.

Create:

```sql
CREATE UNIQUE INDEX "one_active_pool_per_vehicle"
ON "pools" ("vehicleId")
WHERE "status" IN (
  'OPEN',
  'DRIVER_ARRIVED',
  'STARTED'
);

CREATE UNIQUE INDEX "one_active_pool_per_driver"
ON "pools" ("driverId")
WHERE "status" IN (
  'OPEN',
  'DRIVER_ARRIVED',
  'STARTED'
);
```

These indexes provide database-level protection in addition to application-level checks.

---

# 16. Indexing Strategy

## Users

```text
UNIQUE(email)
INDEX(role)
INDEX(role, isActive)
```

Used for authentication and role filtering.

## Vehicles

```text
UNIQUE(driverId)
UNIQUE(code)
INDEX(status)
INDEX(driverId, status)
```

Used for driver vehicle lookup and online vehicles.

## Zones

```text
UNIQUE(name)
INDEX(corridorCode, routeOrder)
INDEX(corridorCode, isActive)
```

Used by matching.

## Zone Routes

```text
UNIQUE(fromZoneId, toZoneId)
INDEX(fromZoneId)
INDEX(toZoneId)
```

Used for fare/distance lookup.

## Rides

```text
INDEX(passengerId, status)
INDEX(status, pickupZoneId)
INDEX(status, createdAt)
INDEX(pickupZoneId, destinationZoneId, status)
INDEX(createdAt)
```

These support passenger history, driver request discovery, and matching.

## Pools

```text
INDEX(driverId, status)
INDEX(vehicleId, status)
INDEX(status, pickupZoneId, corridorCode)
INDEX(createdAt)
```

## Pool Members

```text
UNIQUE(rideId)
UNIQUE(poolId, rideId)
INDEX(poolId, status)
INDEX(rideId)
```

## Status History

```text
INDEX(rideId, createdAt)
INDEX(changedById, createdAt)
```

## Payments

```text
UNIQUE(rideId)
UNIQUE(transactionReference)
INDEX(status)
INDEX(createdAt)
```

Do not add indexes blindly. Every index should support a real query.

---

# 17. Geography Model

Real map routing is deliberately excluded.

Use predefined zones.

Seed at least:

```text
Banani
Gulshan 1
Gulshan 2
Mohakhali
Dhanmondi
Mirpur
Uttara
Farmgate
Bashundhara
```

Each zone has:

```text
name
corridorCode
routeOrder
latitude
longitude
```

---

# 18. Pool Matching Rule

The matching rule must be deterministic and documented.

## Rule

A ride can join a driver's existing OPEN pool when:

1. Driver is authenticated.
2. Driver role is DRIVER.
3. Driver is online.
4. Vehicle is active.
5. Pool belongs to the driver.
6. Pool status is OPEN.
7. New ride has the same pickup zone as the pool.
8. New ride belongs to the same corridor.
9. New destination is valid in the same corridor direction.
10. Enough seats remain.
11. New ride is still in REQUESTED state.

If no compatible pool exists:

- Driver can create a new pool by accepting the request.

---

# 19. Example Matching

Seed story:

```text
Driver:
Jashim

Vehicle:
Bullet
Capacity = 3

Passenger:
Nusrat
Banani → Mohakhali
1 seat

Passenger:
Rafiq
Banani → Gulshan 1
1 seat

Passenger:
Shirin
Banani → Gulshan 2
1 seat
```

All three can belong to the same corridor if the seeded zone configuration defines:

```text
Banani     order 1
Gulshan 1  order 2
Gulshan 2  order 3
Mohakhali  order 4
```

The exact route rule is more important than pretending to calculate real traffic routes.

---

# 20. Fare Model

Use:

```text
passengerFare =
    baseFare
    + distanceCharge
    - poolDiscount
```

All money must be stored as integer **paisa/poysha**.

Never store money as floating point.

## Recommended MVP constants

```text
BASE_FARE = 5000 paisa
PER_METER = 2 paisa
POOL_DISCOUNT = 2000 paisa
```

Therefore:

```text
distanceCharge = distanceMeters × 2

finalFare =
    baseFare
    + distanceCharge
    - poolDiscount
```

Minimum final fare:

```text
0 paisa
```

Example:

### Nusrat

```text
Distance = 4000m

Base = 5000
Distance = 4000 × 2 = 8000
Pool discount = 2000

Final = 5000 + 8000 - 2000
      = 11000 paisa
      = ৳110
```

### Rafiq

```text
Distance = 3000m

Base = 5000
Distance = 3000 × 2 = 6000
Pool discount = 2000

Final = 5000 + 6000 - 2000
      = 9000 paisa
      = ৳90
```

The evaluator can calculate these manually.

---

# 21. Fare Storage

Ride should store:

```text
estimatedDistanceMeters
estimatedFarePaisa
finalFarePaisa
```

At request:

```text
estimatedFarePaisa
```

is calculated.

When a ride is actually pooled:

```text
finalFarePaisa
```

is calculated with the pool discount.

When a ride is not pooled:

```text
finalFarePaisa
```

is calculated without the pool discount.

The fare must be snapshotted on the ride so historical rides do not change if pricing rules are modified later.

---

# 22. Ride State Machine

Allowed lifecycle:

```text
REQUESTED
    │
    ▼
MATCHED
    │
    ▼
DRIVER_ARRIVED
    │
    ▼
STARTED
    │
    ▼
COMPLETED
```

Cancellation:

```text
REQUESTED ───────► CANCELLED

MATCHED ─────────► CANCELLED

DRIVER_ARRIVED ──► CANCELLED only if
                    project policy explicitly
                    allows driver/system cancellation
```

Recommended MVP passenger rule:

```text
Passenger can cancel:
REQUESTED
MATCHED

Passenger cannot cancel:
DRIVER_ARRIVED
STARTED
COMPLETED
CANCELLED
```

---

# 23. Pool State Machine

```text
OPEN
 │
 ▼
DRIVER_ARRIVED
 │
 ▼
STARTED
 │
 ▼
COMPLETED
```

Cancellation:

```text
OPEN → CANCELLED
```

Once the driver marks arrival:

```text
No new passengers can join.
```

Once the pool starts:

```text
No new passengers can join.
```

---

# 24. Individual Passenger Completion & State Matrix

A pool can contain passengers with different destinations.

Example:

```text
Banani
  │
  ├── Gulshan 1 → Rafiq gets off
  │
  ├── Gulshan 2 → Shirin gets off
  │
  └── Mohakhali → Nusrat gets off
```

Therefore:

- Pool lifecycle controls the vehicle.
- Ride lifecycle controls each passenger.
- Driver should be able to complete an individual ride.
- Pool becomes COMPLETED when all active rides are completed/cancelled.

This is more accurate than marking every passenger completed at exactly the same moment.

### State Machine Matrix: Pool vs. Ride Lifecycles

| Driver Action | `Pool` State Transition | `RideRequest` / `PoolMember` State Transition |
| --- | --- | --- |
| Triggers **ARRIVE** at pickup | `OPEN` → `DRIVER_ARRIVED` | ALL associated rides: `MATCHED` → `DRIVER_ARRIVED` |
| Triggers **START** trip | `DRIVER_ARRIVED` → `STARTED` | ALL associated rides: `DRIVER_ARRIVED` → `STARTED` |
| Drops off an individual rider | No change to `Pool` | ONLY that rider's `RideRequest` & `PoolMember` → `COMPLETED` |
| Drops off the last active rider | `STARTED` → `COMPLETED` (Vehicle → `ONLINE`) | The final rider's `RideRequest` & `PoolMember` → `COMPLETED` |

---

# 25. Authentication Requirements

## Register

Input:

```json
{
  "name": "Nusrat",
  "email": "nusrat@example.com",
  "password": "password123",
  "role": "PASSENGER"
}
```

Rules:

- Email required.
- Normalize email to lowercase.
- Password minimum 8 characters.
- Role must be valid.
- Password must never be returned.
- Password stored using Argon2 hash.

---

# 26. Login, Refresh, and Logout Flows

```http
POST /api/v1/auth/login
```

Response body returns only public user details and the access token:

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-access-token",
    "user": {
      "id": "user-id",
      "name": "Nusrat",
      "email": "nusrat@example.com",
      "role": "PASSENGER"
    }
  }
}
```

Refresh token mechanism:

- The refresh token is set via an HTTP `Set-Cookie` header (`httpOnly`, `SameSite=Lax`, `Secure` in production).
- It is never returned in the JSON response body.
- It is stored hashed in the database.

## Refresh Flow

```http
POST /api/v1/auth/refresh
```

- Reads the refresh token from the `httpOnly` cookie.
- Validates against the hashed version in the database.
- Issues a new `accessToken` in the JSON response.
- Issues a new refresh token via the `Set-Cookie` header (Rotation).

## Logout Flow

```http
POST /api/v1/auth/logout
```

- Revokes the current refresh token in the database.
- Clears the refresh token cookie via a `Set-Cookie` header with an expired date.

---

# 27. Authentication Edge Cases

Reject:

- Duplicate email.
- Invalid credentials.
- Inactive account.
- Expired access token.
- Expired refresh token.
- Revoked refresh token.
- Invalid JWT signature.
- Missing authorization.
- Invalid role.

Never return:

```text
"email exists but password was wrong"
```

Use a generic:

```text
Invalid email or password
```

---

# 28. Authorization

Use NestJS Guards.

Example:

```text
JwtAuthGuard
RoleGuard
```

Passenger-only routes:

```text
POST /rides
POST /rides/:id/cancel
GET /rides
```

Driver-only routes:

```text
POST /driver/online
POST /driver/offline
GET /driver/requests
POST /driver/rides/:rideId/accept
POST /driver/pools/:poolId/arrive
POST /driver/pools/:poolId/start
POST /driver/rides/:rideId/complete
```

Ownership must always be checked.

A passenger must never be able to access:

```text
another passenger's ride
```

A driver must never be able to modify:

```text
another driver's pool
```

---

# 29. API Convention

Base URL:

```text
/api/v1
```

Content type:

```text
application/json
```

Use HTTP methods correctly:

```text
GET     read
POST    create/action
PATCH   partial update
DELETE  delete where appropriate
```

---

# 30. Standard Success Response

```json
{
  "success": true,
  "data": {},
  "message": "Ride created successfully"
}
```

For lists:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

---

# 31. Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "RIDE_INVALID_STATE",
    "message": "Ride cannot be started from its current state",
    "details": null
  },
  "timestamp": "2026-09-28T10:00:00.000Z",
  "path": "/api/v1/driver/rides/ride-123/start"
}
```

---

# 32. Error Code Convention

Use stable machine-readable codes.

Examples:

```text
AUTH_INVALID_CREDENTIALS
AUTH_UNAUTHORIZED
AUTH_FORBIDDEN

USER_NOT_FOUND
USER_ALREADY_EXISTS

VEHICLE_NOT_FOUND
VEHICLE_OFFLINE
VEHICLE_CAPACITY_INVALID

ZONE_NOT_FOUND
ROUTE_NOT_SUPPORTED

RIDE_NOT_FOUND
RIDE_INVALID_STATE
RIDE_ALREADY_ACTIVE
RIDE_NOT_OWNED
RIDE_CANNOT_CANCEL

POOL_NOT_FOUND
POOL_INVALID_STATE
POOL_NOT_OWNED
POOL_ROUTE_INCOMPATIBLE
POOL_CAPACITY_EXCEEDED
POOL_ALREADY_ACTIVE

PAYMENT_NOT_FOUND
PAYMENT_ALREADY_PAID
PAYMENT_FAILED

VALIDATION_ERROR
INTERNAL_SERVER_ERROR
```

---

# 33. API Endpoint Specification

## Auth

```text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me
```

## Zones

```text
GET    /zones
GET    /zones/:id
```

## Passenger Rides

```text
POST   /rides/estimate
POST   /rides
GET    /rides
GET    /rides/current
GET    /rides/:id
POST   /rides/:id/cancel
```

## Driver

```text
GET    /driver/vehicle
PATCH  /driver/vehicle
POST   /driver/online
POST   /driver/offline

GET    /driver/requests
GET    /driver/rides
GET    /driver/pools/current

POST   /driver/rides/:rideId/accept

POST   /driver/pools/:poolId/arrive
POST   /driver/pools/:poolId/start

POST   /driver/rides/:rideId/complete
```

## Payments

```text
GET    /rides/:rideId/payment
POST   /driver/rides/:rideId/payment/confirm
```

## Health

```text
GET /health
```

## Swagger

```text
/docs
```

---

# 34. Feature Implementation Roadmap

The backend must be completed before frontend development begins.

---

# PHASE 0 — Project Bootstrap

## Goal

Create a clean monorepo.

Tasks:

- Create GitHub repository.
- Create `backend/`.
- Create `frontend/`.
- Add root README.
- Add `.gitignore`.
- Add `.env.example`.
- Configure Git branches.

Initial branches:

```text
master
pre-release
release/v1.0.0
```

Feature branches:

```text
feature/project-bootstrap
feature/database-schema
feature/auth
feature/zones
feature/vehicle
feature/ride-request
feature/pooling
feature/ride-lifecycle
feature/payment
feature/testing
feature/docker
feature/frontend-auth
...
```

Do not develop directly on master.

The challenge explicitly requires meaningful feature branches and incremental history. fileciteturn0file0L94-L110

---

# PHASE 1 — Backend Bootstrap

Tasks:

- Create NestJS project.
- Install Prisma.
- Connect PostgreSQL.
- Configure environment validation.
- Configure global prefix.
- Configure CORS.
- Configure Helmet.
- Configure global validation.
- Configure Swagger.
- Configure logging.
- Create health endpoint.

Acceptance:

```text
GET /api/v1/health
```

returns:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

---

# PHASE 2 — Database

Implement:

- Prisma schema.
- Migrations.
- Seed.
- PostgreSQL indexes.
- Partial unique indexes.
- Prisma service.

Seed:

```text
Jashim
Bullet

Nusrat
Rafiq
Shirin

Banani
Gulshan 1
Gulshan 2
Mohakhali
Dhanmondi
Mirpur
Uttara
Farmgate
Bashundhara
```

Seed routes:

```text
Banani → Gulshan 1
Banani → Gulshan 2
Banani → Mohakhali
```

Acceptance:

```text
npx prisma migrate dev
npx prisma db seed
```

works.

---

# PHASE 3 — Authentication

Implement:

- Register.
- Login.
- JWT access token.
- Refresh token.
- Refresh token rotation.
- Logout.
- Current user.
- Password hashing.
- JWT guard.
- Role guard.

Tests:

- Register success.
- Duplicate email.
- Login success.
- Invalid credentials.
- Access protected route.
- Expired token.
- Refresh token.
- Logout.
- Role restriction.

---

# PHASE 4 — Users and Roles

Implement:

```text
PASSENGER
DRIVER
ADMIN
```

For MVP:

- PASSENGER
- DRIVER

are enough.

ADMIN can remain reserved for future.

---

# PHASE 5 — Zones and Routes

Implement:

```text
GET /zones
GET /zones/:id
```

Create zone route lookup service.

Edge cases:

- Inactive zone.
- Same pickup/destination.
- Unsupported route.
- Missing route.
- Invalid zone IDs.

---

# PHASE 6 — Driver and Vehicle

Implement:

- Vehicle creation.
- Vehicle update.
- Vehicle retrieval.
- Online.
- Offline.

Rules:

- Only DRIVER can own vehicle.
- Capacity must be >= 1.
- MVP default capacity = 3.
- Driver cannot go offline while STARTED.
- Driver cannot go online if vehicle is inactive.
- Driver cannot create another active pool.

Vehicle status:

```text
OFFLINE
ONLINE
IN_TRIP
```

---

# PHASE 7 — Fare Service

Implement a dedicated `FaresService`.

Input:

```text
pickupZoneId
destinationZoneId
pooled
```

Output:

```json
{
  "distanceMeters": 4000,
  "baseFarePaisa": 5000,
  "distanceFarePaisa": 8000,
  "poolDiscountPaisa": 2000,
  "finalFarePaisa": 11000
}
```

Tests:

- Correct distance.
- Correct base fare.
- Correct discount.
- No negative fare.
- Unsupported route.
- Same zone rejected.

---

# PHASE 8 — Passenger Ride Request

Endpoint:

```text
POST /api/v1/rides
```

Request:

```json
{
  "pickupZoneId": "banani-id",
  "destinationZoneId": "mohakhali-id",
  "requestedSeats": 1,
  "paymentMethod": "CASH"
}
```

Backend flow:

```text
Validate user
    ↓
Validate zones
    ↓
Validate route
    ↓
Check active ride
    ↓
Calculate distance
    ↓
Calculate estimated fare
    ↓
Create ride REQUESTED
    ↓
Create initial status history
```

Response:

```json
{
  "success": true,
  "message": "Ride requested successfully",
  "data": {
    "id": "ride-id",
    "status": "REQUESTED",
    "estimatedFarePaisa": 11000
  }
}
```

---

# PHASE 9 — Driver Request Discovery

Endpoint:

```text
GET /api/v1/driver/requests
```

Only return relevant REQUESTED rides.

Filters:

```text
pickup zone
corridor
created date
```

Do not expose unnecessary passenger data.

---

# PHASE 10 — Pool Creation and Matching

This is the most important backend business logic.

When driver accepts a ride:

```text
BEGIN TRANSACTION

Validate driver
Validate vehicle
Validate ride
Validate ride state
Validate driver online

Find compatible OPEN pool

IF compatible pool exists:
    lock pool row
    verify capacity
    create pool member
    update reservedSeats
    update ride → MATCHED

ELSE:
    create pool
    create pool member
    update reservedSeats
    update ride → MATCHED

create status history

COMMIT
```

---

# 11. Concurrency Strategy

Scenario:

```text
Bullet capacity = 3

Current reserved seats = 2

Nusrat requests 1 seat
Shirin requests 1 seat
```

Both initially see:

```text
1 seat available
```

Only one may succeed.

Use a PostgreSQL transaction with a row lock on the pool.

Conceptually:

```sql
SELECT *
FROM pools
WHERE id = ?
FOR UPDATE;
```

Then:

```text
if reservedSeats + requestedSeats > capacitySnapshot:
    reject
```

Otherwise:

```text
create pool member
update reservedSeats
```

All operations occur inside one transaction.

The database is the source of truth.

Do not solve this only with:

```text
if (availableSeats > 0)
```

in application code.

That is vulnerable to race conditions.

---

# 12. Concurrency Test

Create an integration test:

```text
capacity = 3
reserved = 2

Promise.all([
  requestSeat(Nusrat),
  requestSeat(Shirin)
])
```

Expected:

```text
one succeeds
one fails
reservedSeats = 3
```

Never:

```text
reservedSeats = 4
```

This is one of the most important tests in the project.

---

# PHASE 11 — Ride Lifecycle

Implement:

```text
REQUESTED
MATCHED
DRIVER_ARRIVED
STARTED
COMPLETED
CANCELLED
```

Every transition must go through a state policy/service.

Do not update status randomly from controllers.

Bad:

```ts
ride.status = RideStatus.COMPLETED;
```

Better:

```ts
rideStateService.completeRide(...)
```

The state service validates the transition and writes history.

---

# PHASE 12 — Driver Arrival

Endpoint:

```text
POST /driver/pools/:poolId/arrive
```

Rules:

Pool must be:

```text
OPEN
```

Then:

```text
Pool → DRIVER_ARRIVED
```

All active rides:

```text
MATCHED → DRIVER_ARRIVED
```

New passengers cannot join.

---

# PHASE 13 — Start Trip

Endpoint:

```text
POST /driver/pools/:poolId/start
```

Rules:

```text
Pool must be DRIVER_ARRIVED
```

Then:

```text
Pool → STARTED
```

Active rides:

```text
DRIVER_ARRIVED → STARTED
```

Vehicle:

```text
ONLINE → IN_TRIP
```

---

# PHASE 14 — Complete Individual Ride

Endpoint:

```text
POST /driver/rides/:rideId/complete
```

Rules:

- Driver owns the pool.
- Ride belongs to pool.
- Ride must be STARTED.
- Ride cannot already be completed.
- Payment can then be finalized.

Then:

```text
Ride → COMPLETED
PoolMember → COMPLETED
```

If every ride in the pool is completed/cancelled:

```text
Pool → COMPLETED
Vehicle → ONLINE
```

---

# PHASE 15 — Cancellation

Passenger endpoint:

```text
POST /rides/:id/cancel
```

Allowed:

```text
REQUESTED
MATCHED
```

Not allowed:

```text
DRIVER_ARRIVED
STARTED
COMPLETED
CANCELLED
```

If cancelling a matched ride:

```text
lock pool
mark PoolMember CANCELLED
decrease reservedSeats
mark ride CANCELLED
create status history
```

If all pool members are cancelled:

```text
Pool → CANCELLED
Vehicle → ONLINE
```

---

# 16. Cancellation Edge Cases

Test:

1. Cancel before matching → success.
2. Cancel after matching → success.
3. Cancel after driver arrival → reject.
4. Cancel completed ride → reject.
5. Cancel another passenger's ride → reject.
6. Cancel twice → reject.
7. Cancel last active pool member → pool cancelled.
8. Cancellation during concurrent acceptance → transaction determines result safely.

---

# PHASE 16 — Payments

Support:

```text
CASH
TESLAPAY
```

No real payment gateway.

## Cash

At ride completion:

```text
Payment = PENDING
```

Driver can confirm:

```text
POST /driver/rides/:rideId/payment/confirm
```

Then:

```text
PENDING → PAID
```

## TeslaPay

Simulate successful payment:

```text
Payment = PAID
transactionReference = TP-xxxx
```

Do not implement real wallet integration.

---

# PHASE 17 — Ride History

Passenger:

```text
GET /rides
```

Driver:

```text
GET /driver/rides
```

Include:

```text
pickup
destination
status
fare
payment
created time
completed time
pool information
```

Pagination:

```text
?page=1&limit=20
```

Limit maximum:

```text
100
```

---

# PHASE 18 — Status History

Every important ride transition creates a record.

Example:

```text
REQUESTED
↓
MATCHED
↓
DRIVER_ARRIVED
↓
STARTED
↓
COMPLETED
```

History should contain:

```text
fromStatus
toStatus
changedBy
timestamp
note
```

This allows the evaluator to answer:

> What exactly happened to this ride?

---

# 17. Backend Edge Case Matrix

| Scenario                             | Expected                |
| ------------------------------------ | ----------------------- |
| Invalid email                        | 400                     |
| Duplicate email                      | 409                     |
| Invalid login                        | 401                     |
| Passenger accesses driver route      | 403                     |
| Driver accesses passenger-only route | 403                     |
| Invalid zone                         | 404                     |
| Same pickup/destination              | 400                     |
| Unsupported route                    | 400                     |
| Invalid seat count                   | 400                     |
| Capacity exceeded                    | 409                     |
| Duplicate active ride                | 409                     |
| Invalid ride transition              | 409                     |
| Passenger modifies another ride      | 403/404                 |
| Driver modifies another pool         | 403/404                 |
| Cancel completed ride                | 409                     |
| Start unarrived pool                 | 409                     |
| Complete unstarted ride              | 409                     |
| Vehicle offline when accepting       | 409                     |
| Driver has active pool               | 409                     |
| Expired JWT                          | 401                     |
| Revoked refresh token                | 401                     |
| Invalid payment transition           | 409                     |
| Concurrent final-seat requests       | One succeeds; one fails |

---

# 18. Backend DTO Validation

Use:

```ts
ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});
```

Examples:

```text
requestedSeats >= 1
requestedSeats <= vehicle capacity
email valid
password minimum 8
zone ID valid UUID/cuid format
```

Never trust:

- frontend validation
- frontend role
- frontend fare
- frontend capacity
- frontend ride status

The backend calculates and validates all important values.

---

# 19. Frontend Implementation Order

Only start this after backend APIs and tests are stable.

---

# FRONTEND PHASE 1 — Bootstrap

Create:

```text
Next.js App Router
TypeScript
Tailwind
shadcn/ui
TanStack Query
React Hook Form
Zod
```

Create:

```text
QueryProvider
AuthProvider
API client
global error handling
```

---

# FRONTEND PHASE 2 — Authentication

Pages:

```text
/login
/register
```

Features:

- Login.
- Register.
- Role-aware redirect.
- Logout.
- Session restoration.
- Protected routes.

---

# FRONTEND PHASE 3 — Passenger Dashboard

Show:

```text
Welcome, Nusrat

Current Ride
Available Zones
Request Ride
Recent History
```

---

# FRONTEND PHASE 4 — Ride Request

Form:

```text
Pickup
Destination
Seats
Payment method
```

Then show:

```text
Estimated distance
Estimated fare
Pool eligibility
```

Submit:

```text
Request Ride
```

---

# FRONTEND PHASE 5 — Passenger Ride Tracking

Display:

```text
REQUESTED
MATCHED
DRIVER ARRIVED
STARTED
COMPLETED
```

Use a timeline.

Show:

```text
Driver
Vehicle
Passengers in pool
Your fare
Payment
```

Never expose another passenger's private information unnecessarily.

---

# FRONTEND PHASE 6 — Driver Dashboard

Show:

```text
Online / Offline
Vehicle
Available requests
Current pool
Reserved seats
Passengers
```

---

# FRONTEND PHASE 7 — Driver Flow

Buttons depend on state.

Example:

```text
OPEN
→ Arrived

DRIVER_ARRIVED
→ Start Trip

STARTED
→ Complete Passenger
```

Do not show impossible actions.

---

# FRONTEND PHASE 8 — History

Passenger:

```text
My Ride History
```

Driver:

```text
My Ride History
```

Filters:

```text
Completed
Cancelled
Date
```

---

# 20. Frontend Loading/Error/Empty States

Every important page must have:

### Loading

```text
Skeleton / spinner
```

### Error

```text
Something went wrong.
Retry
```

### Empty

```text
No ride requests found.
```

### Success

Use a clear confirmation.

Never leave the user staring at a blank page.

---

# 21. Frontend API Client

Centralize API communication.

```text
lib/api-client.ts
```

Responsibilities:

- Base URL.
- JSON headers.
- Credentials.
- Access token.
- Refresh on 401.
- Standard error parsing.

Do not scatter:

```text
fetch("http://localhost:3000/...")
```

throughout components.

---

# 22. Frontend Security

Do not store long-lived refresh tokens in:

```text
localStorage
```

Use:

```text
httpOnly cookie
```

Access token:

```text
memory
```

Backend remains the final authorization authority.

---

# 23. Testing Strategy

Do not chase 100% coverage.

Test business risks.

## Unit Tests

Test:

- Fare calculation.
- Matching rules.
- Ride transition rules.
- Pool transition rules.
- Capacity calculations.

## Integration Tests

Test:

- Auth + DB.
- Ride creation + DB.
- Pool creation + DB.
- Payment + DB.

## E2E Tests

Test:

```text
Register
→ Login
→ Request ride
→ Driver accepts
→ Passenger matched
→ Driver arrives
→ Trip starts
→ Ride completes
→ Payment
→ History
```

---

# 24. Mandatory Tests

The source challenge specifically expects meaningful tests around:

- Capacity.
- Invalid state transitions.
- Nusrat/Rafiq fare calculation.
- Authorization.
- Cancellation.
- Concurrent capacity requests. fileciteturn0file0L125-L129

Implement at minimum:

```text
auth.e2e-spec.ts
rides.e2e-spec.ts
pools.e2e-spec.ts
concurrency.e2e-spec.ts
payments.e2e-spec.ts
```

---

# 25. Docker

Root:

```text
docker-compose.yml
```

Services:

```text
postgres
backend
frontend
```

Example architecture:

```yaml
services:
  postgres:
    image: postgres:16-alpine

  backend:
    build: ./backend
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build: ./frontend
    depends_on:
      - backend
```

PostgreSQL health check:

```text
pg_isready
```

Do not commit secrets.

---

# 26. Environment Variables

## Backend

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://...

JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me

ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3001
```

## Frontend

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

Never commit real:

```text
DATABASE_URL
JWT secrets
API keys
passwords
tokens
```

---

# 27. Seed Data

Use the challenge cast.

## Driver

```text
Name: Jashim
Email: jashim@example.com
Role: DRIVER
Vehicle: Bullet
Vehicle Code: BULLET-001
Capacity: 3
```

## Passengers

```text
Nusrat
nusrat@example.com

Rafiq
rafiq@example.com

Shirin
shirin@example.com
```

## Demo rides

```text
Nusrat:
Banani → Mohakhali

Rafiq:
Banani → Gulshan 1

Shirin:
Banani → Gulshan 2
```

The challenge explicitly recommends keeping the named cast consistent in seed data, tests, README, and demo. fileciteturn0file0L185-L189

---

# 28. Recommended Demo Scenario

The six-minute demo should show the core engineering story.

## Step 1

Login as Jashim.

```text
Go Online
```

## Step 2

Login as Nusrat.

```text
Request:
Banani → Mohakhali
```

## Step 3

Driver sees Nusrat.

```text
Accept
```

Pool:

```text
Bullet
Capacity: 3
Reserved: 1
```

## Step 4

Rafiq requests:

```text
Banani → Gulshan 1
```

Jashim accepts.

Pool:

```text
Reserved: 2/3
```

## Step 5

Shirin requests:

```text
Banani → Gulshan 2
```

Jashim accepts.

Pool:

```text
Reserved: 3/3
```

## Step 6

Try another request.

It must fail:

```text
POOL_CAPACITY_EXCEEDED
```

## Step 7

Driver:

```text
Arrive
→ Start
```

## Step 8

Complete Rafiq.

Then:

```text
Rafiq = COMPLETED
```

Nusrat remains:

```text
STARTED
```

This demonstrates individual ride state.

---

# 29. Git Commit Strategy

Commit format:

```text
type(scope): description
```

Allowed types:

```text
feat
fix
refactor
test
docs
chore
build
```

Good:

```text
feat(auth): add passenger registration
feat(auth): add jwt login flow
feat(pool): add compatible pool matching
feat(pool): enforce vehicle seat capacity
test(pool): add concurrent seat allocation test
fix(ride): reject invalid completion transition
build(docker): add postgres compose service
docs(readme): document architecture and setup
```

Bad:

```text
update
changes
final
latest
fix
working now
asdf
```

---

# 30. Recommended Commit Sequence

```text
chore(repo): initialize monorepo

chore(backend): bootstrap nestjs application

chore(database): configure prisma and postgres

feat(database): add core ride pooling schema

feat(database): add seed data

feat(auth): add registration

feat(auth): add jwt login

feat(auth): add refresh token rotation

feat(zone): add predefined dhaka zones

feat(vehicle): add driver vehicle management

feat(fare): add fare calculation service

feat(ride): add passenger ride request

feat(driver): add driver request discovery

feat(pool): add pool creation

feat(pool): add route compatibility

feat(pool): enforce pool capacity

test(pool): add concurrency capacity test

feat(ride): add ride state machine

feat(driver): add arrival and trip start

feat(driver): add individual ride completion

feat(payment): add simulated payments

test(ride): add lifecycle tests

build(docker): add compose environment

docs(api): add swagger documentation
```

---

# 31. Architecture Documentation

Create:

```text
docs/architecture.md
docs/erd.md
docs/decisions.md
```

Architecture diagram:

```text
Browser
  ↓
Next.js
  ↓
REST API
  ↓
NestJS Modules
  ↓
Prisma
  ↓
PostgreSQL
```

ERD should show:

```text
User
 ├── Vehicle
 ├── Ride
 ├── Pool
 └── RefreshToken

Ride
 ├── PoolMember
 ├── Payment
 └── RideStatusHistory

Pool
 ├── PoolMember
 ├── Vehicle
 └── User

Zone
 ├── Ride pickup
 ├── Ride destination
 ├── Pool pickup
 └── ZoneRoute
```

---

# 32. API Documentation

Swagger must document:

- Endpoint.
- Authentication.
- Request body.
- Response.
- HTTP status codes.
- DTO fields.
- Enums.
- Error examples.

Swagger:

```text
/api/v1/docs
```

---

# 33. HTTP Status Code Standard

Use:

```text
200 OK
201 Created
204 No Content

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity

429 Too Many Requests

500 Internal Server Error
```

Recommended:

```text
Invalid state → 409
Capacity exceeded → 409
Duplicate active ride → 409
Unauthorized → 401
Forbidden → 403
Missing resource → 404
Validation → 400
```

---

# 34. Security Requirements

Implement:

- Helmet.
- CORS.
- DTO validation.
- JWT authentication.
- Role guards.
- Ownership checks.
- Bcrypt password hashing.
- Rate limiting.
- No secrets in Git.
- No password in API response.
- No raw refresh tokens in database.
- Generic authentication errors.
- Input sanitization through DTO validation.
- Database constraints.
- Transactional capacity updates.

Rate limit at minimum:

```text
Authentication endpoints
Ride creation
Payment actions
```

---

# 35. Logging

Log:

```text
request method
route
status code
duration
important business events
errors
```

Do not log:

```text
passwords
JWTs
refresh tokens
payment secrets
```

Useful business logs:

```text
Ride requested
Pool created
Passenger joined pool
Pool capacity rejected
Ride cancelled
Trip started
Ride completed
Payment completed
```

---

# 36. Backend Definition of Done

Backend is considered complete only when:

- [ ] NestJS starts.
- [ ] PostgreSQL connects.
- [ ] Prisma migration works.
- [ ] Seed works.
- [ ] Swagger works.
- [ ] Auth works.
- [ ] Role authorization works.
- [ ] Zones work.
- [ ] Vehicle works.
- [ ] Fare calculation works.
- [ ] Passenger can request ride.
- [ ] Driver sees requests.
- [ ] Driver can accept.
- [ ] Pool is created.
- [ ] Compatible passengers can join.
- [ ] Capacity is enforced.
- [ ] Concurrent final-seat test passes.
- [ ] State transitions are enforced.
- [ ] Cancellation works.
- [ ] Individual ride completion works.
- [ ] Payment works.
- [ ] History works.
- [ ] Error format is consistent.
- [ ] Important endpoints have tests.
- [ ] Docker works.

Only after this should frontend implementation begin.

---

# 37. Frontend Definition of Done

- [ ] Login works.
- [ ] Registration works.
- [ ] Role redirect works.
- [ ] Passenger dashboard works.
- [ ] Ride request works.
- [ ] Fare estimate displayed.
- [ ] Current ride displayed.
- [ ] Status timeline works.
- [ ] Cancellation works.
- [ ] History works.
- [ ] Driver dashboard works.
- [ ] Online/offline works.
- [ ] Request list works.
- [ ] Accept works.
- [ ] Pool information works.
- [ ] Arrival works.
- [ ] Start works.
- [ ] Passenger completion works.
- [ ] Payment works.
- [ ] Loading states work.
- [ ] Empty states work.
- [ ] Error states work.
- [ ] Responsive UI works.

---

# 38. README Requirements

README must contain:

1. Project title.
2. One-line summary.
3. Problem statement.
4. Solution overview.
5. Features.
6. Architecture.
7. ERD.
8. Tech stack.
9. Technology justification.
10. Project structure.
11. Prerequisites.
12. Environment variables.
13. Local setup.
14. Docker setup.
15. Migration commands.
16. Seed commands.
17. API documentation.
18. Demo credentials.
19. Testing commands.
20. Deployment.
21. Known limitations.
22. Future improvements.
23. AI usage.
24. Demo video.

The source challenge explicitly requires these README elements. fileciteturn0file0L112-L123

---

# 39. AI Usage Documentation

Include:

```text
AI Tools Used:
- ChatGPT
- GitHub Copilot / Claude Code if used
```

Explain:

```text
What AI helped with:
- Architecture brainstorming
- Boilerplate
- DTO suggestions
- Test case generation
- Debugging
- Documentation
```

Include one accepted suggestion:

```text
AI suggested X.
I accepted it because Y.
```

Include one rejected/modified suggestion:

```text
AI suggested X.
I changed/rejected it because Y.
```

The challenge explicitly allows AI but expects the candidate to understand and own the resulting implementation. fileciteturn0file0L84-L88

---

# 40. Deployment

Use free/free-tier infrastructure only.

Preferred architecture:

```text
Frontend
    ↓
Free Next.js hosting

Backend
    ↓
Free backend hosting where available

Database
    ↓
Free PostgreSQL provider
```

If a free backend is unavailable:

```text
Document Docker deployment instructions
```

Never pay for infrastructure for this assessment.

---

# 41. Production-Minded Improvements After MVP

Only after MVP is stable consider:

## Real-time updates

WebSocket/SSE.

Use for:

```text
ride status
driver arrival
pool membership
```

## Redis

Use for:

```text
short-lived caching
rate limiting
distributed locks
```

## Queue

Use for:

```text
notifications
analytics
non-critical background work
```

## Geospatial

Use:

```text
PostGIS
```

for actual nearby-driver matching.

## Event-driven architecture

Potential events:

```text
RideRequested
RideMatched
PoolCreated
PassengerJoinedPool
DriverArrived
RideStarted
RideCompleted
PaymentCompleted
```

---

# 42. Scaling Thought Exercise

For 1M passengers / 100k drivers:

```text
                  Load Balancer
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
          API Instance        API Instance
              │                   │
              └─────────┬─────────┘
                        ▼
                     Redis
                        │
                        ▼
                 PostgreSQL
                ┌───────┴───────┐
                ▼               ▼
             Primary         Read Replicas
```

Potential improvements:

- Horizontal API scaling.
- PostgreSQL connection pooling.
- Read replicas.
- Redis caching.
- PostGIS.
- Queue/event processing.
- WebSockets.
- Rate limiting.
- Idempotency keys.
- Distributed locks.
- Observability.
- Structured logging.
- Metrics.
- Tracing.

Do not implement these unless required.

The challenge specifically asks for reasoning about scaling rather than unnecessary infrastructure. fileciteturn0file0L125-L129

---

# 43. Important Architectural Decisions

## Decision 1 — Modular Monolith

Use one NestJS application.

Reason:

```text
Small MVP
+
Strong domain boundaries
+
Easy deployment
+
Easy debugging
=
Modular monolith
```

Do not use microservices.

---

## Decision 2 — PostgreSQL Transactions

Pooling modifies multiple records:

```text
Pool
PoolMember
Ride
StatusHistory
```

Therefore operations must be transactional.

---

## Decision 3 — Integer Money

Use:

```text
paisa/poysha
```

because floating point can cause monetary precision problems.

---

## Decision 4 — Database as Source of Truth

Frontend values are never trusted for:

```text
fare
capacity
status
role
ownership
```

---

## Decision 5 — Predefined Zones

No Google Maps API.

Benefits:

```text
deterministic
cheap
testable
easy to demo
```

---

## Decision 6 — Individual Ride + Shared Pool

A pool represents the shared vehicle journey.

A ride represents one passenger's journey.

This separation makes:

```text
individual fare
individual status
individual cancellation
individual completion
```

possible.

---

# 44. Important Invariants

These must always be true.

### Invariant 1

```text
pool.reservedSeats <= pool.capacitySnapshot
```

### Invariant 2

```text
ride.requestedSeats >= 1
```

### Invariant 3

```text
completed ride cannot become STARTED again
```

### Invariant 4

```text
cancelled ride cannot become MATCHED
```

### Invariant 5

```text
only pool owner driver can control pool
```

### Invariant 6

```text
only ride owner passenger can cancel passenger ride
```

### Invariant 7

```text
one passenger cannot have two active rides
```

### Invariant 8

```text
one driver cannot operate two active pools
```

### Invariant 9

```text
pool membership belongs to exactly one ride
```

### Invariant 10

```text
final fare is server calculated
```

---

# 45. Recommended Backend Service Boundaries

Do not put everything into `RidesService`.

Use:

```text
AuthService
UsersService
ZonesService
VehiclesService
FaresService
RidesService
RideStateService
PoolsService
MatchingService
CapacityService
PaymentsService
```

Responsibilities:

### MatchingService

Determines whether a ride can join a pool.

### CapacityService

Handles seat availability and concurrency.

### RideStateService

Controls legal ride transitions.

### PoolService

Creates/updates pool records.

### FareService

Calculates fares.

### PaymentService

Creates and updates payment records.

This makes the business logic easier to explain in an interview.

---

# 46. Recommended Frontend State Management

Do not introduce Redux unless necessary.

Use:

```text
React local state
+
TanStack Query
+
Auth Context
```

TanStack Query handles:

```text
rides
pools
driver requests
history
zones
vehicle
```

Local state handles:

```text
forms
modals
dropdowns
UI state
```

---

# 47. Start Commands

## Root

```bash
mkdir dhaka-tesla-pool
cd dhaka-tesla-pool
git init
```

## Backend

```bash
npx @nestjs/cli new backend
cd backend

npm install @prisma/client
npm install -D prisma
```

Auth:

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install argon2
```

Validation:

```bash
npm install class-validator class-transformer
```

Swagger:

```bash
npm install @nestjs/swagger swagger-ui-express
```

Security:

```bash
npm install helmet
npm install @nestjs/throttler
```

Testing:

```bash
npm install -D supertest @types/supertest
```

Initialize Prisma:

```bash
npx prisma init
```

---

# 48. Frontend Start

From root:

```bash
npx create-next-app@latest frontend
```

Recommended answers:

```text
TypeScript: Yes
ESLint: Yes
Tailwind: Yes
src/: Yes
App Router: Yes
Turbopack: Yes
```

Install:

```bash
cd frontend

npm install @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
```

Then configure shadcn/ui.

---

# 49. Database Commands

Development:

```bash
npx prisma migrate dev --name init
```

Generate:

```bash
npx prisma generate
```

Seed:

```bash
npx prisma db seed
```

Inspect:

```bash
npx prisma studio
```

Production:

```bash
npx prisma migrate deploy
```

---

# 50. Development Order — Final Checklist

Implement exactly in this order:

```text
[ ] 01. Monorepo
[ ] 02. Git branches
[ ] 03. Backend bootstrap
[ ] 04. PostgreSQL
[ ] 05. Prisma
[ ] 06. Database schema
[ ] 07. Database migrations
[ ] 08. Seed data
[ ] 09. Global validation
[ ] 10. Error handling
[ ] 11. Swagger
[ ] 12. Auth registration
[ ] 13. Auth login
[ ] 14. JWT access token
[ ] 15. Refresh token
[ ] 16. Logout
[ ] 17. Role guards
[ ] 18. Zones
[ ] 19. Zone routes
[ ] 20. Vehicle
[ ] 21. Driver online/offline
[ ] 22. Fare service
[ ] 23. Fare tests
[ ] 24. Passenger ride request
[ ] 25. Ride history
[ ] 26. Driver request list
[ ] 27. Pool creation
[ ] 28. Pool matching
[ ] 29. Capacity enforcement
[ ] 30. Concurrency protection
[ ] 31. Concurrency tests
[ ] 32. Ride state machine
[ ] 33. Driver arrival
[ ] 34. Start trip
[ ] 35. Individual ride completion
[ ] 36. Cancellation
[ ] 37. Payment
[ ] 38. Status history
[ ] 39. Authorization tests
[ ] 40. E2E tests
[ ] 41. Docker
[ ] 42. Backend README
[ ] 43. Architecture diagram
[ ] 44. ERD
[ ] 45. Backend complete
[ ] 46. Frontend bootstrap
[ ] 47. Frontend auth
[ ] 48. Passenger dashboard
[ ] 49. Ride request UI
[ ] 50. Passenger tracking
[ ] 51. Driver dashboard
[ ] 52. Driver request UI
[ ] 53. Pool UI
[ ] 54. Payment UI
[ ] 55. History UI
[ ] 56. Loading/error/empty states
[ ] 57. Responsive design
[ ] 58. Frontend integration testing
[ ] 59. Docker full stack
[ ] 60. Deployment
[ ] 61. Final README
[ ] 62. Demo video
[ ] 63. AI usage documentation
[ ] 64. Release v1.0.0
```

---

# 51. Definition of MVP Complete

The MVP is complete when this scenario works end-to-end:

```text
Jashim logs in
      ↓
Jashim goes online
      ↓
Nusrat requests Banani → Mohakhali
      ↓
Jashim accepts
      ↓
Pool created
      ↓
Rafiq requests Banani → Gulshan 1
      ↓
Jashim accepts
      ↓
Rafiq joins same compatible pool
      ↓
Shirin requests compatible route
      ↓
Third seat is allocated
      ↓
Fourth request is rejected
      ↓
Jashim marks arrival
      ↓
Jashim starts trip
      ↓
Rafiq completes
      ↓
Nusrat remains STARTED
      ↓
Nusrat completes
      ↓
Pool completes
      ↓
Payments recorded
      ↓
Ride history available
```

The system must preserve correct data at every step.

---

# 52. Final Quality Checklist

Before submission:

## Product

- [ ] Core story works.
- [ ] Passenger flow works.
- [ ] Driver flow works.
- [ ] Pool flow works.

## Backend

- [ ] Clean modules.
- [ ] DTO validation.
- [ ] JWT.
- [ ] RBAC.
- [ ] Ownership.
- [ ] State machine.
- [ ] Transactions.
- [ ] Capacity locking.
- [ ] Error handling.

## Database

- [ ] Correct relations.
- [ ] Foreign keys.
- [ ] Unique constraints.
- [ ] Partial indexes.
- [ ] Useful indexes.
- [ ] Money as integer.
- [ ] Status history.

## Testing

- [ ] Unit tests.
- [ ] Integration tests.
- [ ] E2E tests.
- [ ] Concurrency test.
- [ ] Authorization test.
- [ ] Invalid transition test.

## Frontend

- [ ] Clean UI.
- [ ] Loading state.
- [ ] Error state.
- [ ] Empty state.
- [ ] Passenger flow.
- [ ] Driver flow.
- [ ] Responsive.

## DevOps

- [ ] Docker.
- [ ] Docker Compose.
- [ ] PostgreSQL health check.
- [ ] Migrations.
- [ ] Seed.
- [ ] Environment variables.

## Documentation

- [ ] README.
- [ ] Architecture.
- [ ] ERD.
- [ ] API docs.
- [ ] Decisions/trade-offs.
- [ ] Known limitations.
- [ ] AI usage.
- [ ] Demo video.

## Git

- [ ] master
- [ ] pre-release
- [ ] release/v1.0.0
- [ ] feature branches
- [ ] meaningful commits

The assessment explicitly treats process, Git history, testing, documentation, ownership, and instruction-following as part of the evaluation—not only whether the final UI works. fileciteturn0file0L145-L162

---

# 53. Final Engineering Principle

Build this project in the following order:

```text
UNDERSTAND
    ↓
DESIGN
    ↓
DATABASE
    ↓
BACKEND
    ↓
TEST
    ↓
FRONTEND
    ↓
INTEGRATE
    ↓
DOCKER
    ↓
DEPLOY
    ↓
DOCUMENT
    ↓
DEMO
```

The most important backend areas to understand deeply are:

```text
1. JWT authentication
2. NestJS guards
3. DTO validation
4. Prisma relations
5. PostgreSQL transactions
6. Pool matching
7. Capacity enforcement
8. Race conditions
9. State machines
10. Authorization/ownership
11. Fare calculation
12. Testing
```

Do not move to frontend simply because the API endpoints exist. Move to frontend after the backend business rules, database integrity, concurrency behavior, and tests are reliable.

The challenge's central expectation is that you can **understand → design → build → commit → test → ship → explain → debug → change** your own system. fileciteturn0file0L191-L197

---

# 54. Mandatory Rubric Artifacts Tracking

Ensure you have completed and submitted the following non-negotiable evaluative items:

## AI Usage Log Template

You must document how AI was used during this project:
- [ ] List of tools used (e.g., ChatGPT, Claude, GitHub Copilot).
- [ ] **1 accepted AI suggestion** with justification.
- [ ] **1 rejected or modified AI suggestion** with justification.

## 6-Minute Loom Demo Script Timecode Checkpoints

Your demo video should strictly feature the PRD seed cast (Jashim, Bullet, Nusrat, Rafiq, Shirin). Ensure you capture these checkpoints:
- [ ] Jashim (driver) login & online status.
- [ ] Nusrat (passenger) ride request & driver acceptance (pool creation).
- [ ] Rafiq (passenger) ride request & driver acceptance (pool join).
- [ ] Shirin (passenger) ride request & driver acceptance (pool capacity reached).
- [ ] Failed request demonstrating capacity enforcement limit (Bullet only holds 3).
- [ ] Trip progression: Jashim arrives, starts trip, and drops off Rafiq while Nusrat remains in the car.
