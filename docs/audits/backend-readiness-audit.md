# Backend Readiness Audit — KLIK-MP

> **Audit date:** 2026-07-11
> **Scope:** Read-only evaluation of codebase before backend implementation begins
> **Status:** Complete

---

## 1. Executive Summary

KLIK-MP is a Next.js 16 full-stack application with extensive frontend feature development using in-memory and mock data layers. The codebase demonstrates disciplined architecture (feature modules, adapter pattern, Zod validation, server-only boundaries), but **zero backend/persistence implementation exists** beyond the Prisma schema (which is a panitia-provided reference schema).

**Key finding:** The entire application currently operates on mock data and in-memory stores. No database writes, no Auth.js sessions, no server-side authorization, and no API endpoints for business operations exist. The Prisma schema (27 models) is valid but unused by application code — it serves as a reference from the panitia.

**Readiness:** The frontend feature contracts are mature enough to begin backend implementation, but the backend foundation (auth, session, role, tenant, Prisma integration) must be built first.

---

## 2. Repository Condition

| Aspect | Status |
|--------|--------|
| Git branch | `feature-simpanan` (uncommitted changes) |
| `npm install` | Works |
| TypeScript strict | Enabled (`strict: true`) |
| ESLint | Config present, run timed out |
| Prisma validate | **PASS** — schema valid |
| Prisma migrations | **None** — no migrations exist |
| Seed | **None** — no seed file |
| `.env` | Exists with placeholder values |
| `.env.example` | Present with docs |

---

## 3. Module Progress

### 3.1 Welcome & Access Flow
- **Route:** `/`, `/access`
- **Status:** `WORKING`
- **UI:** Static welcome page with "Mulai" button → access choice (Daftar/Masuk)
- **Data source:** None (static JSX)
- **Business logic:** None
- **Test:** 2 tests exist but fail (`useRouter` not mounted in test env)

### 3.2 Registration Flow
- **Route:** `/register`, `/register/fingerprint`, `/register/identity`, `/register/manual`, `/register/face`, `/register/password`, `/register/success`
- **Status:** `MOCKED` (mostly working with mocks)
- **Data source:** `MemoryUserStore` (in-memory Map), `MockDukcapilAdapter` (hardcoded data)
- **Business logic:** Zod validation (NIK 16 digits, password min 8, confirmation match), scrypt password hashing via `node:crypto`
- **Server actions:** `registerUser`, `lookupNIK`, `loginUser`, `fingerprintLogin` — all use in-memory stores
- **Test:** 16 tests pass (registration service unit tests)
- **Backend needs:** Prisma User model, Auth.js session, Dukcapil API adapter

### 3.3 Login Flow
- **Route:** `/login`, `/login/biometric`, `/login/manual`
- **Status:** `MOCKED`
- **Data source:** Same `MemoryUserStore`, `MockAuthAdapter`
- **Business logic:** Password verification via `verifyPassword()` (scrypt), login validation
- **Key issue:** Login error message reveals whether NIK is registered (`"NIK belum terdaftar"` vs `"Password salah"`)

### 3.4 Kiosk Home & Intake Flow
- **Route:** `/kiosk`, `/kiosk/intake/new`, `/kiosk/intake/[sessionId]`, `/intake/commodity`, `/intake/capture`, `/intake/assessment`, `/intake/offer`, `/intake/success`
- **Status:** `MOCKED`
- **Data source:** `KioskFlowContext` (useReducer + sessionStorage), `IntakeSessionStore` (in-memory server Map)
- **Business logic:** Intake session state machine (DRAFT→...→COMPLETED) is well-implemented in feature services with Zod validation
- **Session persistence:** In-memory `Map` on server — **lost on restart**
- **Kiosk Home UI:** `WORKING` with fisheye carousel menu (Offtacker, Simpanan, Pinjaman, Klinikdesa, E-Rat)
- **Key gap:** No Prisma persistence for sessions; `IntakeCompletionPort` is a no-op (`async completeAtomically() {}`)

### 3.5 Commodity Capture & Assessment
- **Route:** `/intake/capture`, `/intake/assessment`
- **Status:** `MOCKED`
- **Data source:** `MockCameraAdapter`, `MockScaleAdapter`, `MockAssessmentAdapter`, `MockCommodityVisionAdapter`
- **Business logic:** Gross/tare/net calculation, quality validation, verification flow
- **Test:** 4 tests (2 pass, 1 fail, 1 empty suite)
- **Key gap:** Camera adapter returns data URLs (not persistent URLs), no file upload mechanism, no image persistence

### 3.6 Pricing & Negotiation
- **Route:** `/intake/offer`
- **Status:** `MOCKED`
- **Data source:** `MockMarketPriceAdapter`, `MockPricingAdapter`
- **Business logic:** Reference price × quality factor, counteroffer validation, bidirectional approval
- **Test:** 1 file with 0 tests (empty suite)

### 3.7 Savings Module
- **Route:** `/simpanan`, `/simpanan/principal`, `/simpanan/mandatory`, `/simpanan/voluntary`, with invoice/payment/deposit/withdraw subroutes
- **Status:** `MOCKED`
- **Data source:** `MockSavingsService`, `MockPrintService`, `savings-mock-data.ts`
- **Business logic:** All client-side via `SavingsFlowContext` (useReducer) + mock services
- **Test:** 21 tests pass (components), 2 unit test files exist
- **Key gap:** Entirely mock-based — no account balances, no transaction persistence, no actual payment processing

### 3.8 Clinic Module
- **Route:** `/clinic`, `/clinic/application`, `/clinic/documents`, `/clinic/queue`, `/clinic/review`
- **Status:** `MOCKED`
- **Data source:** `MockClinicService`, `MockQueueService`, `MockQueuePrintService`, `clinic-mock-data.ts`
- **Business logic:** All client-side via `ClinicFlowContext` (useReducer)
- **Test:** 30 tests pass
- **Key gap:** Queue numbers are client-generated (ticketCounter), no actual queue management

### 3.9 Operator Assistance
- **Route:** `/operator`, `/operator/intakes`, `/operator/intakes/[sessionId]`, `/operator/reference-prices`, `/operator/review`
- **Status:** `STATIC_UI` / `MOCKED`
- **Data source:** Mock demo data, in-memory intake sessions
- **Test:** 2 files with 0 tests (empty suites)

### 3.10 Device Bridge
- **Route:** `/api/devices/[capability]`
- **Status:** `WORKING` (proxy implementation complete)
- **Function:** Proxies requests to external device bridge with allowlist, Zod validation, auth header injection, timeout
- **Test:** 1 test file exists

---

## 4. Route Inventory

| Route Group | Pages | Status |
|---|---|---|
| `/` | Welcome | WORKING |
| `/access` | Login/Register choice | WORKING |
| `/register` | Registration form | MOCKED |
| `/register/fingerprint` | Fingerprint registration | MOCKED |
| `/register/identity` | Identity confirmation | MOCKED |
| `/register/manual` | Manual NIK input | MOCKED |
| `/register/face` | Face capture | MOCKED |
| `/register/password` | Password creation | MOCKED |
| `/register/success` | Success screen | MOCKED |
| `/login` | Method choice | MOCKED |
| `/login/biometric` | Biometric login | MOCKED |
| `/login/manual` | Manual login | MOCKED |
| `/kiosk` | Kiosk home dashboard | WORKING |
| `/kiosk/intake/new` | New intake session | MOCKED |
| `/kiosk/intake/[sessionId]` | Intake workflow (wizard) | MOCKED |
| `/kiosk/intake/[sessionId]/receipt` | Receipt page | MOCKED |
| `/intake/commodity` | Commodity selection | MOCKED |
| `/intake/capture` | Weighing + photo | MOCKED |
| `/intake/assessment` | AI assessment | MOCKED |
| `/intake/offer` | Price negotiation | MOCKED |
| `/intake/success` | Completion | MOCKED |
| `/simpanan` | Savings dashboard | MOCKED |
| `/simpanan/principal` | Principal savings | MOCKED |
| `/simpanan/principal/invoice` | Invoice | MOCKED |
| `/simpanan/principal/payment` | Payment | MOCKED |
| `/simpanan/mandatory` | Mandatory savings | MOCKED |
| `/simpanan/mandatory/invoice` | Invoice | MOCKED |
| `/simpanan/mandatory/payment` | Payment | MOCKED |
| `/simpanan/voluntary` | Voluntary savings | MOCKED |
| `/simpanan/voluntary/deposit` | Deposit | MOCKED |
| `/simpanan/voluntary/withdraw` | Withdrawal | MOCKED |
| `/clinic` | Clinic home | MOCKED |
| `/clinic/application` | Application form | MOCKED |
| `/clinic/documents` | Document check | MOCKED |
| `/clinic/queue` | Queue status | MOCKED |
| `/clinic/review` | Review/submit | MOCKED |
| `/operator` | Operator dashboard | STATIC_UI |
| `/operator/intakes` | Intake list | MOCKED |
| `/operator/intakes/[sessionId]` | Intake detail | MOCKED |
| `/operator/reference-prices` | Price reference mgmt | MOCKED |
| `/operator/review` | AI review | MOCKED |
| `/api/devices/[capability]` | Device bridge | WORKING |

No route uses Auth.js, real database, or server-side authorization.

---

## 5. Mock/Client Logic Inventory

| Mock/Client Logic | Route/File | Risk if stays client | Backend Operation | Priority |
|---|---|---|---|---|
| `MemoryUserStore` (in-memory) | `features/registration/adapters/` | User data lost on restart | User CRUD, credential verification | **P0** |
| `MockDukcapilAdapter` | `features/registration/adapters/` | Identity lookup unreliable | Dukcapil API integration, member lookup | P1 |
| `MockAuthAdapter` | `lib/services/mock-auth.ts` | No real auth, no session | Auth.js + credential verification | **P0** |
| `KioskFlowContext` (sessionStorage) | `features/kiosk-flow/context/` | Session lost on browser close, server can't validate | Server session management, IntakeSession persistence | **P0** |
| `IntakeSessionStore` (in-memory Map) | `features/intake-transaction/server/` | All sessions lost on restart | Prisma IntakeSession model | **P0** |
| `MockSavingsService` | `features/savings/services/` | No real balance, no transaction integrity | Savings accounts, transactions, invoices | **P0** |
| `MockClinicService` | `features/clinic/services/` | No real queue management | Clinic applications, queue tickets | P1 |
| `MockAssessmentAdapter` | `lib/services/mock-assessment.ts` | No real AI integration | CV adapter + assessment persistence | P1 |
| `MockPricingAdapter` | `lib/services/mock-pricing.ts` | Price calculation can't be trusted | Server-side pricing service | **P0** |
| `MockReceiptPrinterAdapter` | `lib/services/mock-receipt.ts` | No receipt persistence | Receipt/QR generation + print job | P1 |
| `calculateNetWeight` (client) | `features/kiosk-flow/validation/` | Weight calculation untrusted | Server-side net weight calculation | **P0** |
| `savingsService.getSummary()` (mock) | `features/savings/services/` | Fake balance data | Server-side balance query | **P0** |
| `queueService` (mock) | `features/clinic/services/` | Fake queue numbers | Atomic queue number generation | P1 |
| `crypto.randomUUID()` in actions | `features/intake-transaction/actions/` | Audit ID collision risk | DB-generated IDs | P2 |
| `generateDocumentNumber()` (client counter) | `features/savings/services/` | Document number collision on restart | DB sequence for document numbers | **P0** |
| `ticketCounter` (in-memory) | `features/clinic/mocks/` | Queue ticket collision | Atomic queue counter | P1 |
| Login error revealing NIK existence | `features/registration/services/login.ts` | Information disclosure | Generic error message regardless of cause | **P0** |

### Data that must NOT be trusted from client:
- User ID, anggota ID, role, koperasi ID (no auth yet)
- Weight (gross, tare, net — must be server-calculated from scale)
- Price (reference, offer, counteroffer, total)
- Grade/quality assessment
- Balance amounts
- Transaction status
- Approval flags
- Queue numbers

---

## 6. Backend Architecture Readiness

### Current Architecture:
```
UI Component
  ↓
Client Context (useReducer)
  ↓
Mock Service (in-memory)
  ↓
(no database)
```

### Target Architecture:
```
UI Component
  ↓
Server Action / Route Handler
  ↓
Authentication + Authorization + Zod
  ↓
Domain Service
  ↓
Repository
  ↓
Prisma
  ↓
PostgreSQL
```

### Architecture Gaps:

| Layer | Current State | Gap | Severity |
|---|---|---|---|
| `app/api/` | Only `/api/devices/[capability]` | No business API endpoints | P0 |
| `lib/auth/` | Only `password.ts` (hash/verify) | No Auth.js, no session, no role | **P0** |
| `lib/db/` | Prisma client singleton ready | No database operations implemented | **P0** |
| `lib/permissions/` | Does not exist | No role guard, ownership guard | **P0** |
| `lib/validations/` | Only Zod in features | No centralized validation layer | P2 |
| `server/services/` | Only intake-transaction has real services | Most domains use client services | P1 |
| `server/repositories/` | Does not exist | No data access layer | **P0** |
| Prisma usage | Schema validates but not used | No queries, no writes | **P0** |

### Existing Strengths:
- `PrismaPg` adapter with `PrismaClient` singleton is properly set up
- `server-only` boundary already used (`session-store.ts`)
- Zod validation on all feature service boundaries
- Intake transaction service has proper state machine with allowed transitions
- Audit trail pattern (append-only immutable entries) is implemented
- Scrypt password hashing via `node:crypto` with `timingSafeEqual`
- Device bridge proxy with allowlist, Zod validation, size limits, auth header

---

## 7. Auth and Authorization Gap

| Requirement | Status | Finding |
|---|---|---|
| Password hashing | ✅ | scrypt via `node:crypto`, `salt:hash` format |
| Auth.js session | ❌ | Not implemented |
| Server-side role guard | ❌ | No roles defined |
| Ownership guard | ❌ | Not possible without auth |
| Tenant isolation | ❌ | `koperasi_ref` not validated anywhere |
| Rate limiting | ❌ | Not implemented |
| Login error safety | ❌ | Leaks NIK existence |
| Session management | ❌ | `sessionStorage` only (client-side) |
| User model in Prisma | ❌ | Not in schema |
| Role/permission model | ❌ | Not defined |

---

## 8. API/Service Gap

| Domain | Server Actions | Route Handlers | Real Service | Database |
|---|---|---|---|---|
| Registration | ✅ (uses memory) | ❌ | ❌ | ❌ |
| Login | ✅ (uses memory) | ❌ | ❌ | ❌ |
| Intake session | ✅ (uses memory) | ❌ | ✅ (state machine) | ❌ |
| Commodity capture | ❌ | ❌ | ❌ | ❌ |
| Commodity assessment | ❌ | ❌ | ❌ | ❌ |
| Pricing | ❌ | ❌ | ❌ | ❌ |
| Savings | ❌ | ❌ | ❌ | ❌ |
| Clinic | ❌ | ❌ | ❌ | ❌ |
| Queue | ❌ | ❌ | ❌ | ❌ |
| Receipt/QR | ❌ | ❌ | ❌ | ❌ |

---

## 9. Security and Data-Integrity Risks

| Risk | Location | Impact | Severity |
|---|---|---|---|
| Login error leaks NIK registration status | `login.ts:22` | Enumeration attack | **P0** |
| All session data in `sessionStorage` | `kiosk-flow-context.tsx` | XSS → full session theft | **P0** |
| No server-side authorization anywhere | Entire app | Anyone can call any action | **P0** |
| In-memory session store (lost on restart) | `session-store.ts` | Data loss, no recovery | **P0** |
| `IntakeCompletionPort` is a no-op | `session-actions.ts:151` | Completion does nothing | **P0** |
| No tenant isolation | All queries | Cross-tenant data leak | P0 |
| Mock pricing calculations on client | `mock-pricing.ts` | Price manipulation possible | **P0** |
| Financial amounts use `number` (float) | All savings/price code | Floating-point rounding errors | P1 |
| Queue ticket counter is in-memory | `clinic-mock-data.ts` | Counter reset on restart | P1 |
| No file upload validation | Camera adapter | No restriction on uploads | P1 |
| No audit log persistence | All features | No audit trail survives restart | **P0** |

---

## 10. Testing Status

| Command | Result | Notes |
|---|---|---|
| `npm ls --depth=0` | PASS | All deps installed |
| `npx prisma validate` | PASS | Schema valid |
| `npm run test` | **5 FAIL / 17 PASS** | 2 test failures, 5 empty suites |
| `npm run lint` | NOT RUN | Timed out (>60s) |
| `npm run typecheck` | NOT RUN | Timed out (>60s) |
| `npm run build` | NOT RUN | Depends on typecheck |
| `npm run test:e2e` | NOT RUN | Requires build + server |

### Test Failure Details:
1. `app/page.test.tsx` (2 failures): `useRouter` not mounted — test setup issue
2. `commodity-capture-panel.test.tsx` (1 failure): Orchestration test failed
3. 5 test files with **0 tests** (empty suites): `intake.test.ts`, `IntakeWorkflow.test.tsx`, `operator.test.ts`, `OperatorComponents.test.tsx`, `PricingNegotiationPanel.test.tsx`

### Test Coverage Gaps:
- No integration tests with database
- No API route tests (except device bridge)
- No auth/authorization tests
- No backend service tests
- E2E tests exist but not runnable

---

## 11. P0/P1/P2 Findings Summary

### P0 — Blocker (backend cannot start without these)
1. **No Auth.js or session management** — every action is unauthenticated
2. **No User model in Prisma schema** — no identity foundation
3. **No role/permission system** — authorization impossible
4. **No tenant isolation** — `koperasi_ref` not validated server-side
5. **Login error leaks NIK existence** — security vulnerability
6. **All session data in client sessionStorage** — no server-side authority
7. **IntakeCompletionPort is a no-op** — completions do nothing
8. **In-memory session store** — all data lost on restart
9. **Mock pricing/balance calculations** — critical data untrusted
10. **No database operations** — Prisma client exists but unused
11. **Table prefix not defined** — cannot create team tables on shared DB

### P1 — Required for MVP vertical slice
1. Dukcapil integration (real API or replicated DB)
2. File upload mechanism for commodity photos
3. Real device adapter integration (scale, camera, fingerprint)
4. Queue number atomic generation
5. Queue service with Prisma persistence
6. Reference price management with persistence
7. Receipt/QR generation with signed payloads
8. Print job queue
9. Clinic application with persistence
10. Savings account, transaction, and invoice with persistence
11. Idempotency keys for critical operations
12. Atomic transaction completion

### P2 — Post-MVP improvement
1. Rate limiting on login
2. Audit log aggregation service
3. Centralized error response format
4. File upload validation (type, size, scan)
5. PII masking in logs
6. Optimistic concurrency control
7. Service layer unit test expansion
8. Database integration test suite
9. E2E test automation
10. Schema naming cleanup (where allowed)

---

## 12. Blocker and Decisions Needed

| Blocker | Impact | Decision needed from |
|---|---|---|
| Table prefix not defined | Cannot create any team table | Panitia / integration owner |
| Auth.js Credentials vs custom auth | Auth architecture | Technical lead |
| Role model structure | Authorization design | Product owner |
| `koperasi_ref` source of truth | Tenant isolation | Panitia |
| Dukcapil integration approach | Identity verification | Product owner |
| File storage backend | Photo persistence | Infrastructure team |
| Device bridge availability | Hardware integration | Hardware team |
| Prisma migration strategy | Schema deployment | Integration owner |
| Savings interest/penalty rules | Financial logic | Cooperative policy |
| Clinic service catalog source | Service data | Clinic management |
