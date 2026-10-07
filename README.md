# Zoop Delivery Agent Management System (DAMS)

A production-grade, highly resilient backend API and operations dashboard built for competitive backend and full-stack evaluations (Zoop Internship Assignment).

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![NodeJS](https://img.shields.io/badge/Node.js-Express.js-green?logo=node.js)
![NextJS](https://img.shields.io/badge/Next.js-14_App_Router-black?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_Prisma-336791?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-Cache--Aside-dc382d?logo=redis)
![Tests](https://img.shields.io/badge/Tests-42_Passed-brightgreen?logo=jest)

---

## 1. Project Overview

The **Delivery Agent Management System (DAMS)** is a high-performance fleet operations service designed to track, manage, and dispatch delivery personnel across metropolitan service areas. It combines persistent relational storage (PostgreSQL via Prisma ORM) with high-throughput, race-free caching (Redis) and an operations dashboard (Next.js 14).

### Key Highlights
* **Zero Scope Creep:** Strictly adheres to Zoop requirements—no unnecessary abstractions or domain bloat.
* **Deterministic Concurrency Protection:** Atomic versioned namespaces eliminate stale cache overwrites on concurrent updates without expensive distributed locks.
* **Resilient Fail-Open Architecture:** If Redis encounters network partitions or downtime, the API falls back seamlessly to PostgreSQL without dropping user requests.
* **Comprehensive Automated Verification:** 42 automated unit and integration tests covering CRUD operations, validation edge cases, cache hit/miss semantics, invalidation, fail-open fallback, and concurrency races.

---

## 2. Features

* **Complete CRUD Lifecycle:**
  * Register delivery agents with canonical phone normalization (supports Indian 10-digit mobile numbers `9876543210` $\rightarrow$ `+919876543210` and international formats).
  * Paginated listing with multi-field search (`q`), zone filtering (`serviceArea`), status filtering (`ACTIVE`/`INACTIVE`), and column sorting.
  * Individual agent retrieval via UUID v4 with cache acceleration.
  * Partial updates (`PATCH`) with duplicate phone/email collision detection.
  * Agent deletion (`DELETE`) with synchronous detail and query cache invalidation.
* **Redis Cache-Aside Acceleration:**
  * Per-agent versioned detail caching (`dams:agents:detail:{id}:v{version}`).
  * $O(1)$ master list namespace invalidation (`dams:agents:list:v{version}:{hash}`).
  * Non-blocking, zero `KEYS *` / `SCAN` operations.
* **Health & Dependency Telemetry:**
  * Multi-tier healthcheck (`/api/v1/health`) distinguishing healthy, degraded (fail-open), and critical failure states.
* **Operations Dashboard (Next.js 14):**
  * Live fleet metrics, status filtering, debounced search, loading skeletons, responsive modal forms, safety deletion dialogs, and individual agent dossier views with cache telemetry.

---

## 3. System Architecture

```
                                 SYSTEM TOPOLOGY
                                 
   ┌────────────────────────────────────────────────────────────────────────┐
   │                 Next.js Operations Dashboard (Port 3000)               │
   │  [Live Search] [Zone Filters] [Dossier Modal] [Metrics] [Toasts]       │
   └───────────────────────────────────┬────────────────────────────────────┘
                                       │ HTTP / REST / JSON
                                       ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                  Express + TypeScript API (Port 4000)                  │
   │  Helmet ──▶ CORS ──▶ Request ID ──▶ Zod Validation ──▶ Controller      │
   └─────────────────┬────────────────────────────────────┬─────────────────┘
                     │                                    │
            [Cache-Aside Read]                   [Relational Mutation]
                     │                                    │
                     ▼                                    ▼
        ┌────────────────────────┐           ┌────────────────────────┐
        │   Redis 7 (Port 6379)  │           │ PostgreSQL 16 (Port 5432)│
        │  • Detail: v{version}  │           │  • Prisma ORM          │
        │  • List: O(1) Version  │           │  • UUID v4 PKs         │
        │  • Resilient Fail-Open │           │  • Unique Phone/Email  │
        └────────────────────────┘           └────────────────────────┘
```

### Layered Separation of Concerns
```
Client Request 
  ──▶ Express Router (/api/v1/agents)
  ──▶ Security & Tracing (Helmet, CORS, Request ID Middleware)
  ──▶ Zod Schema Validation (body, query, params)
  ──▶ Agent Controller (DTO extraction, status code mapping)
  ──▶ Agent Service (business logic, uniqueness enforcement, cache orchestration)
  ──▶ Redis CacheService / PostgreSQL PrismaService
  ──▶ Standardized JSON Envelope (ApiSuccessEnvelope / ApiErrorEnvelope)
```

---

## 4. Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v18+) | Non-blocking I/O, industry standard for microservices |
| **Framework** | Express.js | Minimalist, predictable middleware pipeline |
| **Language** | TypeScript (v5.7) | Strict type safety, prevents runtime type errors |
| **Database** | PostgreSQL 16 | ACID compliance, robust indexing on status/areas |
| **ORM** | Prisma 5.22 | Type-safe queries, migration management, parameterized SQL |
| **Cache** | Redis 7 (ioredis) | Sub-millisecond reads, atomic counters (`INCR`) |
| **Validation**| Zod 3.23 | Schema validation with input sanitization and transformations |
| **Frontend** | Next.js 14 + Tailwind CSS | React Server Components, responsive internal dashboard |
| **Testing** | Jest + Supertest | Automated integration and concurrency test suites |

---

## 5. Repository Structure

```
delivery-agent-ms/
├── docker-compose.yml              # Optional containerized PostgreSQL & Redis
├── package.json                    # Monorepo workspaces & convenience scripts
├── README.md                       # Complete documentation & evaluator guide
│
├── backend/
│   ├── .env                        # Local environment configuration
│   ├── .env.example                # Sample environment template
│   ├── jest.config.js              # Jest configuration (ts-jest)
│   ├── package.json
│   ├── tsconfig.json               # Strict TypeScript configuration
│   ├── prisma/
│   │   ├── schema.prisma           # DeliveryAgent model, enums, indexes
│   │   ├── migrations/             # Idempotent SQL migration files
│   │   └── seed.ts                 # 25 realistic mock agents generator
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.config.ts       # Zod-validated environment config
│   │   │   └── redis.config.ts     # Resilient Redis connection manager
│   │   ├── constants/
│   │   │   ├── errorCodes.ts       # Standardized domain error codes
│   │   │   └── httpStatus.ts       # HTTP status code mapping
│   │   ├── errors/
│   │   │   ├── AppError.ts         # Base application error class
│   │   │   ├── BadRequestError.ts  # 400 Bad Request
│   │   │   ├── ConflictError.ts    # 409 Conflict
│   │   │   ├── NotFoundError.ts    # 404 Not Found
│   │   │   └── ValidationError.ts  # 400 Validation Error with field details
│   │   ├── middlewares/
│   │   │   ├── errorHandler.ts     # Centralized error handler (no stack leaks)
│   │   │   ├── requestId.ts        # Correlation ID tracing middleware
│   │   │   └── validate.ts         # Generic Zod validation middleware
│   │   ├── modules/agents/
│   │   │   ├── agent.controller.ts # Transport layer & response serialization
│   │   │   ├── agent.routes.ts     # Route mapping with validation guards
│   │   │   ├── agent.schemas.ts    # Zod schemas & phone normalizer
│   │   │   ├── agent.service.ts    # Business logic & cache orchestration
│   │   │   └── agent.types.ts      # TypeScript DTOs & interfaces
│   │   ├── routes/
│   │   │   ├── health.routes.ts    # Multi-tier healthcheck endpoint
│   │   │   └── index.ts            # Root API v1 router
│   │   ├── services/
│   │   │   ├── cache.service.ts    # Race-free cache-aside & versioning engine
│   │   │   └── prisma.service.ts   # PrismaClient singleton & liveness check
│   │   ├── utils/
│   │   │   ├── queryHash.util.ts   # Deterministic query parameter hasher
│   │   │   └── response.util.ts    # Unified JSON envelope utilities
│   │   ├── app.ts                  # Express application configuration
│   │   └── server.ts               # HTTP server & graceful shutdown handler
│   └── tests/
│       ├── setup.ts                # Jest lifecycle setup & teardown
│       ├── unit/
│       │   └── validation.test.ts  # Normalization & schema unit tests (14 tests)
│       └── integration/
│           ├── agents.crud.test.ts # Complete CRUD lifecycle tests (14 tests)
│           ├── agents.cache.test.ts# Cache-aside & fail-open tests (9 tests)
│           ├── agents.concurrency.test.ts # Race-condition protection (2 tests)
│           └── health.test.ts      # Multi-tier healthcheck tests (3 tests)
│
└── frontend/
    ├── package.json
    ├── next.config.mjs
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── src/
        ├── app/
        │   ├── globals.css         # Custom utilities & scrollbars
        │   ├── layout.tsx          # Root navbar & system status badges
        │   └── page.tsx            # Fleet operations dashboard
        ├── components/
        │   ├── dashboard/
        │   │   ├── AgentDetailsModal.tsx # Dossier modal & cache telemetry
        │   │   ├── AgentModal.tsx  # Create/Edit agent modal form
        │   │   ├── AgentTable.tsx  # Sortable table with view/edit/delete
        │   │   ├── DeleteDialog.tsx# Safety confirmation dialog
        │   │   ├── FilterBar.tsx   # Search & filter toolbar
        │   │   └── MetricCards.tsx # Fleet metric cards & acceleration stats
        │   └── ui/
        │       ├── Skeleton.tsx    # Table & card skeleton loaders
        │       └── Toast.tsx       # Non-blocking notification toasts
        ├── services/
        │   └── api.ts              # API client with error handling
        └── types/
            └── agent.ts            # Frontend domain types
```

---

## 6. Prerequisites

* **Node.js:** v18.0.0 or higher (v20+ recommended)
* **npm:** v9.0.0 or higher
* **PostgreSQL:** Port `5432` accessible
* **Redis:** Port `6379` accessible
* *(Optional)* **Docker & Docker Compose**

---

## 7. Environment Variables

### Backend Configuration (`backend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment (`development`, `production`, `test`) | `development` |
| `PORT` | HTTP server port | `4000` |
| `CORS_ORIGIN` | Allowed CORS origin URL | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string with schema parameter | `postgresql://postgres:postgres@localhost:5432/delivery_agent_ms?schema=public` |
| `REDIS_URL` | Redis server connection URI | `redis://localhost:6379` |
| `REDIS_TTL_DETAIL_SECONDS` | Time-to-live for individual agent detail caches | `900` (15 minutes) |
| `REDIS_TTL_LIST_SECONDS` | Time-to-live for paginated query caches | `300` (5 minutes) |

### Frontend Configuration (`frontend/.env.local` optional)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend REST API | `http://localhost:4000/api/v1` |

---

## 8. Database Setup & Prisma Migrations

### 1. Configure Database Connection
Ensure PostgreSQL is running and credentials match `backend/.env`.

### 2. Run Database Migrations
Apply existing migrations to establish the `delivery_agents` table, `AgentStatus` enum, and compound indexes:
```bash
npm --prefix backend run prisma:migrate
```

### 3. Seed Realistic Demo Data
Populate the database with 25 delivery agents across multiple zones:
```bash
npm --prefix backend run prisma:seed
```

---

## 9. Redis Setup

Ensure Redis 7 is running on port `6379`:
```bash
# Verify Redis is ready
redis-cli ping
# Expected: PONG
```

If Redis is running under Linux/WSL or a remote host, ensure `bind 0.0.0.0` or proper network bridging is enabled.

---

## 10. Startup Instructions

### Step 1: Install Dependencies
```bash
# Root & workspace dependencies
npm install
npm --prefix backend install
npm --prefix frontend install
```

### Step 2: Start Development Servers
From the repository root, start both services:
```bash
# Start backend API (Port 4000)
npm run dev:backend

# Start frontend dashboard (Port 3000)
npm run dev:frontend
```

Alternatively, from the repository root:
* Backend: `http://localhost:4000`
* Frontend: `http://localhost:3000`

---

## 11. Test Commands

Run the complete automated test suite across all 5 test suites:
```bash
npm --prefix backend run test
```

### Test Suite Breakdown (42 Total Tests)
1. **`validation.test.ts` (14 Unit Tests):**
   * Indian phone canonicalization (`9876543210` $\rightarrow$ `+919876543210`).
   * Leading zero stripping (`09876543210` $\rightarrow$ `+919876543210`).
   * Special character removal (`+91 98765-43210` $\rightarrow$ `+919876543210`).
   * International E.164 formats (`+14155550198`).
   * Schema validations (name length, email format, UUID format, query defaults).
2. **`agents.crud.test.ts` (14 Integration Tests):**
   * POST create (201 Created + Location header).
   * POST duplicate email rejection (409 Conflict).
   * POST duplicate phone rejection (409 Conflict).
   * POST malformed body & malformed JSON (400 Bad Request).
   * GET paginated list (200 OK + metadata).
   * GET detail by UUID (200 OK).
   * GET 404 on missing UUID.
   * GET 400 on malformed UUID.
   * PATCH partial update (200 OK).
   * PATCH email collision rejection (409 Conflict).
   * DELETE agent (204 No Content).
   * Post-deletion 404 confirmation.
   * Server error sanitization (500 without stack leaks).
3. **`agents.cache.test.ts` (9 Integration Tests):**
   * Detail cache MISS on first read, HIT on second read.
   * Detail cache eviction & version bump on PATCH.
   * Master list cache invalidation on new agent registration.
   * Delete invalidation ensuring deleted record returns 404, not cached data.
   * **Fail-Open Architecture:** Complete verification that CREATE, LIST, DETAIL, UPDATE, and DELETE function seamlessly when Redis is offline.
4. **`agents.concurrency.test.ts` (2 Integration Tests - Phase 4 Mandatory):**
   * **Simulated Race Condition:** GET (Redis Miss) $\rightarrow$ DB fetch returns old record $\rightarrow$ concurrent UPDATE occurs & bumps version $\rightarrow$ GET attempts cache write. Proves that stale data is NEVER written to Redis.
   * Parallel concurrent HTTP reads and mutations test.
5. **`health.test.ts` (3 Integration Tests):**
   * 200 OK Healthy when PostgreSQL and Redis are both active.
   * 200 OK Degraded when Redis is offline (fail-open mode documented in message).
   * 503 Service Unavailable when PostgreSQL is down.

---

## 12. REST API Documentation

Base URL: `http://localhost:4000/api/v1`

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Dependency healthcheck | `200` (healthy/degraded), `503` (unhealthy) |
| `POST` | `/agents` | Register a new delivery agent | `201`, `400`, `409`, `500` |
| `GET` | `/agents` | List agents with pagination & search | `200`, `400`, `500` |
| `GET` | `/agents/:id` | Get individual agent profile | `200`, `400`, `404`, `500` |
| `PATCH` | `/agents/:id` | Partially update an agent | `200`, `400`, `404`, `409`, `500` |
| `DELETE` | `/agents/:id` | Remove a delivery agent | `204`, `400`, `404`, `500` |

### Query Parameters for `GET /api/v1/agents`
* `page` (number, default: `1`): Current page number.
* `limit` (number, default: `10`, max: `100`): Records per page.
* `status` (string, optional): Filter by `ACTIVE` or `INACTIVE`.
* `serviceArea` (string, optional): Case-insensitive partial zone match.
* `q` (string, optional): Case-insensitive search across name, email, and phone.
* `sortBy` (string, default: `createdAt`): Sort field (`createdAt`, `name`, `status`, `serviceArea`).
* `sortOrder` (string, default: `desc`): `asc` or `desc`.

---

## 13. Example Request & Response Payloads

### 1. Register New Delivery Agent
**Request:**
```http
POST /api/v1/agents HTTP/1.1
Host: localhost:4000
Content-Type: application/json

{
  "name": "Arjun Sharma",
  "phone": "9876543201",
  "email": "arjun.sharma@zoop.delivery",
  "serviceArea": "Central Delhi",
  "status": "ACTIVE"
}
```

**Response (`201 Created`):**
```http
HTTP/1.1 201 Created
Location: /api/v1/agents/d4c8e763-7188-4c91-a16f-9989d97bf9b7
Content-Type: application/json; charset=utf-8

{
  "success": true,
  "data": {
    "id": "d4c8e763-7188-4c91-a16f-9989d97bf9b7",
    "name": "Arjun Sharma",
    "phone": "+919876543201",
    "email": "arjun.sharma@zoop.delivery",
    "serviceArea": "Central Delhi",
    "status": "ACTIVE",
    "createdAt": "2026-10-05T19:00:00.000Z",
    "updatedAt": "2026-10-05T19:00:00.000Z"
  },
  "meta": {
    "timestamp": "2026-10-05T19:00:00.021Z",
    "cached": false,
    "requestId": "req_84d7be11-827c-4874-9b63-0ea1dc191fcb"
  }
}
```

### 2. Paginated List Query
**Request:**
```http
GET /api/v1/agents?page=1&limit=2&status=ACTIVE HTTP/1.1
Host: localhost:4000
```

**Response (`200 OK`):**
```http
HTTP/1.1 200 OK
X-Cache: HIT
Content-Type: application/json; charset=utf-8

{
  "success": true,
  "data": [
    {
      "id": "d4c8e763-7188-4c91-a16f-9989d97bf9b7",
      "name": "Arjun Sharma",
      "phone": "+919876543201",
      "email": "arjun.sharma@zoop.delivery",
      "serviceArea": "Central Delhi",
      "status": "ACTIVE",
      "createdAt": "2026-10-05T19:00:00.000Z",
      "updatedAt": "2026-10-05T19:00:00.000Z"
    }
  ],
  "meta": {
    "timestamp": "2026-10-05T19:01:15.110Z",
    "cached": true,
    "requestId": "req_1082c9e7-578f-4ad1-9ef2-8cc79c2980bc",
    "pagination": {
      "page": 1,
      "limit": 2,
      "totalRecords": 25,
      "totalPages": 13,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## 14. Error Response Format

All error responses adhere strictly to the `ApiErrorEnvelope` contract:

```typescript
interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; issue: string }>;
  };
  meta: {
    timestamp: string;
    requestId?: string;
  };
}
```

### Example: Validation Error (`400 Bad Request`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed",
    "details": [
      {
        "field": "phone",
        "issue": "Phone number must be a valid 10-15 digit number (e.g. 9876543210 or +919876543210)"
      },
      {
        "field": "email",
        "issue": "Invalid email address format"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-10-05T19:02:00.123Z",
    "requestId": "req_3a2b1c"
  }
}
```

### Example: Resource Not Found (`404 Not Found`)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Delivery agent not found with ID \"00000000-0000-0000-0000-000000000000\""
  },
  "meta": {
    "timestamp": "2026-10-05T19:02:10.456Z",
    "requestId": "req_9f8e7d"
  }
}
```

### Example: Duplicate Key Conflict (`409 Conflict`)
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "An agent with email \"arjun.sharma@zoop.delivery\" already exists",
    "details": [
      {
        "field": "email",
        "issue": "Email address must be unique"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-10-05T19:02:20.789Z",
    "requestId": "req_5e4d3c"
  }
}
```

---

## 15. Redis Caching & Invalidation Deep Dive

### 15.1 The Concurrency / Race Condition Solution
In high-concurrency systems, naive cache-aside (`DEL key`) causes stale cache resurrection:
1. `Reader 1` misses cache, reads old record from DB.
2. `Writer 1` updates DB, deletes cache key.
3. `Reader 1` finishes and writes old record into Redis.
4. Redis now serves stale data until TTL expires.

#### The DAMS Version Check Guard
* Detail caches use atomic versions:
  * Key: `dams:agents:detail:{id}:v{version}`
  * Version pointer: `dams:agents:detail:version:{id}`
* Before writing to Redis, `getAgentById` checks:
  ```typescript
  const currentVersion = await CacheService.getDetailVersion(id);
  if (currentVersion === version) {
    await CacheService.set(cacheKey, agent, env.REDIS_TTL_DETAIL_SECONDS);
  }
  ```
  If a mutation occurred during the DB query, `currentVersion !== version`, so the write is **silently aborted**. The stale data is never cached.

### 15.2 $O(1)$ List Invalidation (No `KEYS *` or `SCAN`)
* Query caching embeds a global list version counter:
  * Key: `dams:agents:list:v{listVersion}:{queryHash}`
* On any mutation (CREATE, UPDATE, DELETE):
  ```typescript
  await redisClient.incr('dams:agents:list:version');
  ```
  Incrementing this integer invalidates all cached query permutations across all filters and pages in $O(1)$ time (< 0.1ms) without scanning keys.

### 15.3 Resilient Fail-Open Design
Redis is an acceleration layer, not a bottleneck.
* All Redis operations in `CacheService` are wrapped in try-catch guards checking `redisManager.isReady()`.
* If Redis drops:
  * Cache reads return `null` (treated as a cache miss).
  * Cache writes are bypassed.
  * The API falls back transparently to PostgreSQL with `200 OK`.
  * `/api/v1/health` marks status as `degraded`.

---

## 16. Design Decisions & Trade-Offs

1. **Atomic Version Namespaces vs. Distributed Locks (Redlock):**
   * *Decision:* Used atomic version counters in Redis rather than Redlock.
   * *Rationale:* Distributed locks introduce latency, contention, and failure modes when locks expire mid-query. Versioned namespaces achieve 100% race safety with zero locking overhead.
2. **$O(1)$ Version Invalidation vs. `KEYS *` / `SCAN`:**
   * *Decision:* Implemented a master integer version counter for list queries.
   * *Rationale:* `KEYS *` blocks Redis's single-threaded event loop. `SCAN` requires multi-round-trip iteration. Versioning provides instant, zero-cost invalidation.
3. **E.164 Canonical Phone Normalization:**
   * *Decision:* Zod transform pipeline canonicalizes raw 10-digit Indian numbers (`9876543210`) into `+919876543210`.
   * *Rationale:* Enables uniform database uniqueness constraints and prevents duplicate agents with formatting differences.
4. **Fail-Open vs. Fail-Closed:**
   * *Decision:* Fail-open for Redis, fail-closed for PostgreSQL.
   * *Rationale:* Business continuity dictates that delivery dispatch operations must not halt simply because a cache node restarted.

---

## 17. Known Limitations

1. **In-Memory Search vs. Full-Text Search:**
   * Search query `q` uses PostgreSQL's `contains` with `mode: 'insensitive'` across name, email, and phone. For fleets larger than 100,000 agents, PostgreSQL `tsvector` or Elasticsearch would be recommended.
2. **Hard Deletes:**
   * `DELETE /api/v1/agents/:id` performs a hard database delete as requested by standard CRUD requirements. In enterprise production, soft deletes (`deletedAt: DateTime?`) with an audit trail are often preferred.

---

## 18. Optional Docker Deployment

If you prefer containerized dependencies:
```bash
# Start PostgreSQL and Redis via Docker Compose
docker compose up -d

# Verify services are healthy
docker compose ps
```
The application will connect to the exposed ports `localhost:5432` and `localhost:6379`.

---

## 19. Evaluation & Verification Checklist

- [x] Node.js + Express + TypeScript with strict typing.
- [x] Persistent PostgreSQL database via Prisma ORM with migrations.
- [x] All 8 required agent fields present and typed.
- [x] Complete CRUD operations (Create, List, Detail, Update, Delete).
- [x] RESTful HTTP status codes (200, 201, 204, 400, 404, 409, 500, 503).
- [x] Redis caching with race-free versioning and $O(1)$ list invalidation.
- [x] Resilient fail-open architecture tested and verified.
- [x] Concurrency race condition test implemented and passing.
- [x] Operations dashboard with real-time telemetry and 0 console errors.
- [x] 42 automated tests passing with 100% pass rate.
