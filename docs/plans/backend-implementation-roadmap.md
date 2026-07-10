# Backend Implementation Roadmap — KLIK-MP

> **Date:** 2026-07-11
> **Status:** Draft (awaiting confirmation of several decisions)
> **Prerequisite:** Audit documents A and B must be reviewed before implementation begins

---

## 1. Target Architecture

```
Browser (Next.js Client)
  │
  ├── Server Actions (mutation)
  └── Route Handlers (query)
        │
        ▼
  Authentication + Authorization Layer
  │   Auth.js session → getUser()
  │   Role guard → requireRole("member", "officer", "admin")
  │   Tenant guard → requireKoperasiScope(koperasiRef)
  │   Ownership guard → requireOwnership(resourceId, userId)
  │
  ▼
  Zod Validation Layer
  │   Input validation
  │   Business rule validation
  │
  ▼
  Domain Service Layer
  │   Pure business logic
  │   State machine transitions
  │   Calculation (weight, price, balance)
  │
  ▼
  Repository Layer
  │   Prisma queries
  │   Transaction boundaries
  │   Idempotency checks
  │
  ▼
  Prisma Client (singleton)
  │   Read: panitia models (read-only)
  │   Write: <TEAM_PREFIX>_* tables
  │
  ▼
  PostgreSQL (shared database)
  │   Panitia schema: read-only
  │   KLIK-MP schema: <TEAM_PREFIX>_*
```

### Key Architecture Decisions:
1. **Next.js App Router full-stack** — no separate Express backend
2. **Auth.js Credentials** — for session management (as specified in INITIAL_PROJECT_PROMPT.md)
3. **Prisma 7** — already configured with `PrismaPg` adapter
4. **Server Actions** — for mutations
5. **Route Handlers** — for queries and external API proxy
6. **Zod** — on all server boundaries (already practiced)
7. **Domain services** — pure functions with Zod validation (already partially implemented)

---

## 2. Dependency Map

```
                   ┌──────────────────────┐
                   │   Table prefix from   │
                   │      panitia          │
                   └──────────┬───────────┘
                              │
              ┌───────────────▼────────────────┐
              │     Phase 1: Foundation         │
              │  ┌──────────────────────────┐   │
              │  │ Auth.js + Session + Role  │   │
              │  │ User + UserRole models    │   │
              │  │ Tenant scope isolation    │   │
              │  └────────────┬─────────────┘   │
              └───────────────┼─────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│ Phase 2: Intake  │ │ Phase 3:    │ │ Phase 4: Clinic  │
│ (depends on      │ │ Savings     │ │ (independent)    │
│  auth + member)  │ │ (depends on │ │                  │
│                  │ │  auth)      │ │                  │
└──────────────────┘ └──────────────┘ └──────────────────┘
          │
          ▼
┌──────────────────┐
│ Phase 2b:        │
│ Cashier/Receipt  │
└──────────────────┘
          │
          ▼
┌──────────────────┐
│ Phase 5:         │
│ Hardware/API     │
│ Integration      │
└──────────────────┘
```

---

## 3. Vertical Slice Sequence

### Phase 0 — Pre-requisite (BLOCKED)

| Task | Details | Dependency |
|---|---|---|
| Obtain table prefix | Contact panitia for `<TEAM_PREFIX>` | Panitia decision |
| Confirm database access | Verify DATABASE_URL works, read-only access to panitia tables | Infrastructure |
| Confirm koperasi_ref | Determine which koperasi_ref KLIK-MP uses for tenant scope | Product owner |
| Choose role model | Define roles: member, officer/officer, admin | Product owner |

---

### Phase 1 — Foundation (Week 1)

**Goal:** Auth, session, role, tenant, and Prisma integration working end-to-end

| Step | What | Files | Models | Acceptance |
|---|---|---|---|---|
| 1.1 | Add User, UserRole, Session models to Prisma schema with `@@map("<PREFIX>_users")` | `prisma/schema.prisma` | `users`, `user_roles` | Schema validates |
| 1.2 | Create first migration | `prisma/migrations/` | — | Migration applies cleanly |
| 1.3 | Implement Auth.js Credentials provider | `lib/auth/authjs.ts`, `app/api/auth/[...nextauth]/route.ts` | — | Login creates session |
| 1.4 | Create `registerUser` server action with Prisma | `features/registration/actions/register.ts` | `users` | Registration persists |
| 1.5 | Create `loginUser` server action with Auth.js | `features/registration/actions/login.ts` | `users` | Login creates Auth.js session |
| 1.6 | Implement role guard utility | `lib/auth/authorization.ts` | — | Guards block unauthorized |
| 1.7 | Implement tenant scope utility | `lib/auth/tenant.ts` | — | Queries scoped to koperasi_ref |
| 1.8 | Fix login error message (generic) | `features/registration/services/login.ts` | — | No info disclosure |
| 1.9 | Create seed script with demo accounts | `prisma/seed.ts` | `users`, `user_roles` | `npx prisma db seed` works |
| 1.10 | Add idempotency_keys table | Prisma schema | `idempotency_keys` | Schema validates |
| 1.11 | Add audit_logs table | Prisma schema | `audit_logs` | Schema validates |
| 1.12 | Update existing server actions to use Prisma | `features/intake-transaction/actions/session-actions.ts` | — | Sessions persist |

**Definition of Done:**
- [ ] Registration creates user in database
- [ ] Login creates Auth.js session
- [ ] Role guard prevents unauthorized access
- [ ] Tenant scope prevents cross-koperasi access
- [ ] All existing server actions use Prisma (not in-memory)
- [ ] Login error does not reveal NIK existence
- [ ] `npm run test` passes (existing + new tests)
- [ ] `npm run build` passes

---

### Phase 2 — Member Identity & Intake Vertical Slice (Week 2)

**Goal:** Complete offtaker flow from identity verification to receipt, with all data persisted

| Step | What | Files | Models | Acceptance |
|---|---|---|---|---|
| 2.1 | Create commodity_intakes table | Prisma schema | `commodity_intakes` | Session CRUD |
| 2.2 | Create intake_captures table | Prisma schema | `intake_captures` | Capture CRUD |
| 2.3 | Create intake_assessments table | Prisma schema | `intake_assessments` | Assessment CRUD |
| 2.4 | Create intake_offers table | Prisma schema | `intake_offers` | Offer CRUD |
| 2.5 | Create intake_negotiations table | Prisma schema | `intake_negotiations` | History CRUD |
| 2.6 | Create intake_approvals table | Prisma schema | `intake_approvals` | Approval CRUD |
| 2.7 | Create commodity_receipts table | Prisma schema | `commodity_receipts` | Receipt CRUD |
| 2.8 | Implement IntakeSessionRepository | `server/repositories/intake-repository.ts` | All intake | Atomic operations |
| 2.9 | Implement real IntakeCompletionPort | `features/intake-transaction/server/completion-port.ts` | All intake | Atomic completion |
| 2.10 | Migrate intake server actions to Prisma | `features/intake-transaction/actions/session-actions.ts` | All intake | End-to-end |
| 2.11 | Implement member lookup from anggota_koperasi | `server/services/member-service.ts` | `anggota_koperasi` (read) | Lookup by NIK |
| 2.12 | Add biometric verification event table | Prisma schema | `biometric_credentials` | Verification audit |
| 2.13 | Server-side net weight calculation | `server/services/intake-service.ts` | — | Weight trusted |
| 2.14 | Server-side price calculation | `server/services/pricing-service.ts` | — | Price trusted |

**Definition of Done:**
- [ ] Member identity verification writes to DB
- [ ] Intake session persists across server restart
- [ ] Weighing record persists with server-calculated net
- [ ] Assessment record persists with verification
- [ ] Offer and negotiation history persists
- [ ] Buyer/seller approval persists
- [ ] Completion atomically writes transaction + receipt + stock
- [ ] Receipt can be regenerated
- [ ] Demo scenario works end-to-end with persistence

---

### Phase 2b — Cashier & Receipt (Week 2-3)

| Step | What | Files | Models | Acceptance |
|---|---|---|---|---|
| 2b.1 | Cashier review API | `app/api/cashier/review/route.ts` | `intake_approvals` | Officer approves/rejects |
| 2b.2 | Signed QR receipt generation | `lib/services/receipt.ts` | `commodity_receipts` | QR without PII |
| 2b.3 | Print job queue (if hardware) | `server/services/printer-service.ts` | `print_jobs` | Print job queued |
| 2b.4 | Inventory movement recording | `features/intake-transaction/services/inventory.ts` | `inventory_movements` | Stock updated |
| 2b.5 | Reference price management | `server/services/reference-price-service.ts` | `market_prices` | Price CRUD with approval |

---

### Phase 3 — Savings (Week 3)

**Goal:** Simpanan Pokok, Wajib, dan Sukarela with real balances and transactions

| Step | What | Models | Notes |
|---|---|---|---|
| 3.1 | Create savings_accounts table | `savings_accounts` | One per member per type |
| 3.2 | Create savings_obligations table | `savings_obligations` | Mandatory payment schedule |
| 3.3 | Create savings_transactions table | `savings_transactions` | Debit/credit ledger |
| 3.4 | Create payment_invoices table | `payment_invoices` | Invoice generation |
| 3.5 | Create withdrawal_requests table | `withdrawal_requests` | Approval flow |
| 3.6 | Implement SavingsService with Prisma | `server/services/savings-service.ts` | |
| 3.7 | Server-side balance calculation | `server/services/savings-service.ts` | From transaction ledger |
| 3.8 | Atomic payment processing | `server/services/savings-service.ts` | With idempotency |
| 3.9 | Withdrawal approval flow | `server/services/savings-service.ts` | PENDING_APPROVAL → APPROVED |
| 3.10 | Invoice printing | `server/services/print-service.ts` | |

**Money handling:** Use `Prisma.Decimal` (PostgreSQL `numeric`) for all financial fields. Never use JavaScript `number` for currency.

---

### Phase 4 — KlinikDesa (Week 3-4)

**Goal:** Queue management with atomic ticket numbers

| Step | What | Models | Notes |
|---|---|---|---|
| 4.1 | Create clinic_applications table | `clinic_applications` | Application lifecycle |
| 4.2 | Create clinic_queue_tickets table | `clinic_queue_tickets` | Atomic queue number |
| 4.3 | Create clinic_consents table | `clinic_consents` | Patient consent records |
| 4.4 | Implement ClinicService with Prisma | `server/services/clinic-service.ts` | |
| 4.5 | Atomic queue number generation | `server/services/queue-service.ts` | DB sequence or counter |
| 4.6 | Duplicate submission detection | `server/services/queue-service.ts` | By member + date |
| 4.7 | Queue status and estimated wait | `server/services/queue-service.ts` | |

---

### Phase 5 — Hardware/API Integration (Week 4+)

**Goal:** Replace mock adapters with real device bridge calls

| Step | What | Notes |
|---|---|---|
| 5.1 | Real fingerprint adapter end-to-end | Requires device bridge ready |
| 5.2 | Real face recognition adapter | Requires device bridge ready |
| 5.3 | Real scale adapter | HTTP or WebSerial |
| 5.4 | Real camera with upload | `app/api/upload/route.ts` |
| 5.5 | Real commodity vision AI | Requires model endpoint |
| 5.6 | Real market price source | Requires integration |
| 5.7 | Real thermal printer | USB or network printer |

---

## 4. API Proposal

### Auth
| Method | Route | Auth | Role | Request | Response |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | No | — | `{ nik, namaLengkap, password }` | `{ userId }` |
| POST | `/api/auth/login` | No | — | `{ nik, password }` | Auth.js session |
| POST | `/api/auth/logout` | Yes | Any | — | — |
| GET | `/api/auth/session` | Yes | Any | — | Current session |
| POST | `/api/auth/fingerprint` | No | — | `{ fingerprintRef }` | Auth.js session |

### Members
| Method | Route | Auth | Role | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/members/lookup` | Yes | officer | `?nik=` | Member data |
| GET | `/api/members/:id` | Yes | member/officer | — | Member profile |
| GET | `/api/members/:id/savings` | Yes | member/officer | — | Savings summary |

### Intakes
| Method | Route | Auth | Role | Request | Response |
|---|---|---|---|---|---|
| POST | `/api/intakes` | Yes | member | — | New intake session |
| GET | `/api/intakes/:id` | Yes | member/officer | — | Session state |
| POST | `/api/intakes/:id/capture` | Yes | officer | `{ gross, tare, imageUrl }` | Capture record |
| POST | `/api/intakes/:id/assess` | Yes | officer | `{ commodityType, grade }` | Assessment |
| POST | `/api/intakes/:id/offer` | Yes | officer | `{ price }` | Offer created |
| POST | `/api/intakes/:id/negotiate` | Yes | member | `{ counteroffer, reason }` | Negotiation |
| POST | `/api/intakes/:id/approve` | Yes | member/officer | `{ party }` | Approval |
| POST | `/api/intakes/:id/complete` | Yes | officer | `{ settlement }` | Completion |
| POST | `/api/intakes/:id/cancel` | Yes | officer | — | Cancellation |
| GET | `/api/intakes/:id/receipt` | Yes | member/officer | — | Receipt data |

### Receipts
| Method | Route | Auth | Role | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/receipts/:number` | Yes | officer | — | Receipt + QR |
| POST | `/api/receipts/:number/print` | Yes | officer | — | Print job |
| POST | `/api/receipts/:number/validate` | Yes | officer | — | Cashier validation |

### Cashier
| Method | Route | Auth | Role | Request | Response |
|---|---|---|---|---|---|
| POST | `/api/cashier/receipts/scan` | Yes | officer | `{ qrData }` | Receipt info |
| POST | `/api/cashier/receipts/:id/approve` | Yes | officer | — | Mark approved |
| POST | `/api/cashier/receipts/:id/reject` | Yes | officer | `{ reason }` | Mark rejected |

### Savings
| Method | Route | Auth | Role | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/savings/summary` | Yes | member | — | All savings types |
| POST | `/api/savings/principal/invoice` | Yes | member | — | Invoice |
| POST | `/api/savings/mandatory/pay` | Yes | member | `{ amount, period }` | Payment |
| POST | `/api/savings/voluntary/deposit` | Yes | member | `{ amount }` | Deposit |
| POST | `/api/savings/voluntary/withdraw` | Yes | member | `{ amount, reason }` | Withdrawal request |
| GET | `/api/savings/transactions` | Yes | member | `?page=&limit=` | Transaction history |

### Clinic
| Method | Route | Auth | Role | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/clinic/services` | Yes | member | — | Available services |
| POST | `/api/clinic/applications` | Yes | member | `{ serviceId, documents }` | Create application |
| GET | `/api/clinic/applications/:id` | Yes | member | — | Application status |
| POST | `/api/clinic/applications/:id/consent` | Yes | member | — | Provide consent |
| GET | `/api/clinic/queue/:ticketId` | Yes | member | — | Queue status |

---

## 5. Service/Repository Boundaries

```
┌─────────────────────────────────────────────────┐
│                  Server Action                    │
│  - Authentication check                          │
│  - Role guard                                    │
│  - Tenant scope                                  │
│  - Zod validation on input                       │
│  - Call domain service                           │
│  - Call repository for persistence               │
│  - Idempotency check                             │
│  - Revalidation after mutation                   │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│               Domain Service                     │
│  - Pure business logic                           │
│  - No direct database access                     │
│  - Zod validation on all unsafe input            │
│  - State machine transitions                     │
│  - Calculation (net weight, price, balance)      │
│  - Returns result or throws typed error          │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│                 Repository                       │
│  - Prisma queries only                          │
│  - Transaction boundaries                       │
│  - Idempotency key check/write                  │
│  - Audit log append                             │
│  - Maps DB models to domain types               │
└─────────────────────────────────────────────────┘
```

### Existing services that can be largely preserved:
- `features/intake-transaction/services/intake.ts` — state machine is correct, only needs repository integration
- `features/kiosk-flow/validation/kiosk-validation.ts` — validation logic is correct
- `lib/auth/password.ts` — password hashing is production-ready

### Services that must be rewritten:
- `features/registration/services/register.ts` — replace MemoryUserStore with Prisma
- `features/registration/services/login.ts` — replace MemoryUserStore + add Auth.js
- `features/savings/services/savings-service.ts` — replace mock with Prisma
- `features/clinic/services/clinic-service.ts` — replace mock with Prisma
- All `lib/services/mock-*.ts` — replace with real implementations or keep as test fixtures

---

## 6. Migration Strategy

### Principles
1. **Every migration must be named descriptively** (e.g., `20260711_add_users_and_roles`)
2. **Review generated SQL** before applying
3. **Never use `prisma db push`** for persistent changes
4. **Never run destructive operations** on shared database
5. **Test migrations** on isolated database first

### Migration Order
| Order | Name | Tables |
|---|---|---|
| 1 | `add_team_prefix_and_app_models` | `<PREFIX>_users`, `<PREFIX>_user_roles`, `<PREFIX>_idempotency_keys`, `<PREFIX>_audit_logs` |
| 2 | `add_intake_domain` | `<PREFIX>_commodity_intakes`, `<PREFIX>_intake_captures`, `<PREFIX>_intake_assessments`, `<PREFIX>_intake_offers`, `<PREFIX>_intake_negotiations`, `<PREFIX>_intake_approvals`, `<PREFIX>_commodity_receipts` |
| 3 | `add_savings_domain` | `<PREFIX>_savings_accounts`, `<PREFIX>_savings_obligations`, `<PREFIX>_savings_transactions`, `<PREFIX>_payment_invoices`, `<PREFIX>_withdrawal_requests` |
| 4 | `add_clinic_domain` | `<PREFIX>_clinic_applications`, `<PREFIX>_clinic_queue_tickets`, `<PREFIX>_clinic_consents` |
| 5 | `add_inventory_and_prices` | `<PREFIX>_inventory_movements`, `<PREFIX>_market_prices`, `<PREFIX>_print_jobs`, `<PREFIX>_file_attachments` |

### Testing Strategy
- Development database: Local PostgreSQL with full migration apply
- Test database: Separate PostgreSQL database or schema for integration tests
- CI: `prisma migrate deploy` on test database

---

## 7. Test Strategy

### Unit Tests (Vitest — existing pattern)
| Area | What to test | Priority |
|---|---|---|
| Validation | All Zod schemas | P1 |
| Calculation | Net weight, price, balance, queue number | P1 |
| State machine | All intake transitions (already tested) | P0 |
| Permission | Role guard, ownership guard | P0 |
| QR payload | No PII in QR | P1 |
| Idempotency | Duplicate key detection | P0 |

### Integration Tests (NEW — needs database)
| Area | What to test | Priority |
|---|---|---|
| Repository | CRUD operations with Prisma | P0 |
| Transaction | Atomic multi-table operations | P0 |
| Unique constraint | Duplicate NIK, duplicate approval | P0 |
| Idempotency | Repeated submission protection | P0 |
| Ownership | User can only access own data | P0 |
| Tenant isolation | Cross-koperaci access blocked | P0 |
| Rollback | Transaction failure rollback | P0 |

**Integration test database:** Must use separate database. Never run on shared/panitia database.

### API Tests
| Area | What to test | Priority |
|---|---|---|
| Unauthenticated | Reject requests without session | P0 |
| Unauthorized | Reject wrong role | P0 |
| Invalid input | Reject malformed Zod input | P0 |
| Not found | 404 for missing resources | P1 |
| Conflict | Duplicate submission | P0 |
| Happy path | Full flow success | P0 |

### E2E Tests (Playwright — existing)
| Area | What to test | Priority |
|---|---|---|
| Registration + login | Full auth flow | P1 |
| Intake → cashier | Complete offtaker flow | P1 |
| Savings | Payment and withdrawal | P2 |
| Clinic | Application and queue | P2 |

---

## 8. Definition of Done (per phase)

### Phase 1 DoD:
- [ ] Table prefix obtained and applied to all new models
- [ ] Prisma schema with `<PREFIX>_users` and `<PREFIX>_user_roles`
- [ ] Migration created, SQL reviewed, applied cleanly
- [ ] Auth.js Credentials provider working
- [ ] Registration writes to database
- [ ] Login creates valid session
- [ ] Role guard blocks unauthorized server actions
- [ ] Tenant guard scopes queries to `koperasi_ref`
- [ ] Login error is generic (does not reveal NIK existence)
- [ ] Seed script creates demo accounts
- [ ] Idempotency key table created
- [ ] Audit log table created
- [ ] Existing server actions use Prisma (no in-memory stores)
- [ ] `npm run test` passes
- [ ] `npm run build` passes

### Phase 2 DoD:
- [ ] All intake tables created with proper constraints
- [ ] `IntakeCompletionPort` completes atomically
- [ ] Intake sessions survive server restart
- [ ] Net weight calculated server-side
- [ ] Price calculated server-side
- [ ] Member identity verified from `anggota_koperasi`
- [ ] Biometric verification events recorded
- [ ] Full intake flow demo works with persistence
- [ ] Receipt can be retrieved after restart

### Phase 3 DoD:
- [ ] Savings balances calculated from transaction ledger
- [ ] Principal payment creates invoice + transaction
- [ ] Mandatory payment creates invoice + transaction
- [ ] Voluntary deposit creates transaction
- [ ] Withdrawal request with approval flow
- [ ] All financial amounts use Decimal
- [ ] Idempotency prevents double payment

### Phase 4 DoD:
- [ ] Clinic application persists
- [ ] Queue numbers are atomic and survive restart
- [ ] Duplicate submission detection works
- [ ] Consent records are stored

---

## 9. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Table prefix not provided | HIGH | Blocks ALL database work | Escalate to panitia immediately; prepare schema with placeholder prefix |
| Database connection unavailable | MEDIUM | Blocks all persistence | Verify DATABASE_URL early; prepare local PostgreSQL alternative |
| Auth.js version compatibility | LOW | Auth delayed | Already using Next.js 16 with compatible Auth.js |
| Panitia schema changes | MEDIUM | Read model queries break | Pin schema version; use views/aliases if needed |
| Device bridge not ready | HIGH | Mock dependency persists | Phase 5 can be scheduled last; mock fallbacks exist |
| Migration conflicts with other teams | MEDIUM | DB conflicts | Use team prefix strictly; coordinate with integration owner |
| Biometric data privacy requirements | MEDIUM | Feature blocked | Design for opaque references only; no raw biometric storage |
| Physical kiosk hardware unavailable | HIGH | Cannot test real flow | Mock mode sufficient for development demo |
| Shared database performance | LOW | Slow queries | Index application tables; keep panitia queries read-only |
| Team member availability | MEDIUM | Delayed timeline | Vertical slices minimize cross-team dependencies |

---

## 10. Decisions That Must Be Confirmed Before Implementation

| Decision | Options | Impact if not decided | Recommended |
|---|---|---|---|
| **Table prefix** | [Ask panitia] | Cannot create any table | — |
| **Auth strategy** | Auth.js Credentials vs custom JWT | Auth architecture | **Auth.js Credentials** (per INITIAL_PROJECT_PROMPT.md) |
| **Role model** | `member` / `officer` / `admin` vs more granular | Authorization design | **Start with 3 roles** (member, officer, admin) |
| **Default koperasi_ref** | Single koperasi vs multi-tenant | Tenant scope | **Ask product owner** which koperasi for MVP |
| **Savings period** | Calendar month vs custom | Obligation calculation | **Calendar month** (simplest) |
| **Mandatory amount** | Fixed per period | Financial logic | **From env or DB config** |
| **Clinic services source** | Hardcoded vs DB | Service catalog | **DB-driven** for flexibility |
| **Queue numbering scheme** | Daily reset vs continuous | Queue ticket format | **Daily reset** (A-001 format) |
| **Receipt numbering scheme** | Sequential vs UUID | Receipt reference | **Sequential with prefix** (KMP-YYYYMMDD-XXX) |
| **File storage** | Local vs S3 vs DB | Photo persistence | **Local filesystem with URL reference** (simplest for MVP) |
| **Biometric storage** | Opaque reference only | Privacy compliance | **Opaque reference only** — no raw templates |
