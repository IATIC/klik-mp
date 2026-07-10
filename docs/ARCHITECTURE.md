# KLIK-MP Architecture

## Product boundary

KLIK-MP is a kiosk-assisted commodity intake workflow for Koperasi Desa/Kelurahan Merah Putih. Sellers must be members. A non-member can become eligible by settling the principal savings directly or by authorizing deduction from the transaction margin.

SIMKOPDES and CoopTrade integrations are explicitly outside the MVP.

## Feature boundaries

```text
identity-membership
        |
        v
commodity-capture --> commodity-assessment
        |                      |
        +----------+-----------+
                   v
          pricing-negotiation
                   |
                   v
          intake-transaction
                   |
                   v
          operator-assistance
```

Each feature exposes its public contract only through `features/<feature>/index.ts`. Page files compose exported feature components and must not contain business logic.

## Session lifecycle

```text
DRAFT
-> IDENTITY_VERIFIED
-> MEMBERSHIP_READY
-> COMMODITY_CAPTURED
-> COMMODITY_ASSESSED
-> OFFER_CREATED
-> NEGOTIATING
-> AGREED
-> COMPLETED
```

Alternative terminal paths:

- `OFFER_CREATED -> REJECTED`
- Any state before `COMPLETED -> CANCELLED`

Only the intake-transaction module orchestrates transitions across feature outputs. It must not recalculate identity, weight, assessment, or pricing results.

## Runtime integration

Browser-capable hardware may connect directly through a feature adapter. Hardware or AI services that require a vendor SDK run behind an HTTPS device bridge. The Next.js route `/api/devices/[capability]` proxies only allowlisted capabilities and keeps bridge credentials on the server.

Mocks are limited to local development and automated tests. A mock result must never be silently substituted when the real bridge is unavailable.

## Database coordination

Feature database requirements are documented in `docs/contracts/`. Feature workstreams do not edit Prisma schema or create migrations. The integration owner reviews the combined requirements and will design a prefixed schema and serialized migration in a separate database phase.

No database schema or data is changed by this implementation phase.
