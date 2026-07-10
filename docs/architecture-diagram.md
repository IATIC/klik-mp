```mermaid
---
title: KLIK-MP — Ideal Architecture
---
graph TB
  subgraph Client["Kiosk Browser"]
    NextApp["Next.js App<br/>(React + Tailwind + shadcn)"]

    subgraph Pages["Route Groups"]
      KIOSK["(kiosk)<br/>Login · Register · Intake<br/>Pinjaman · Clinic · Savings"]
      OPERATOR["(operator)<br/>Session Review · Approval<br/>Reference Prices"]
    end

    subgraph State["Client State"]
      CTX["KioskFlow Context<br/>useReducer + sessionStorage"]
    end

    subgraph Components["Key Components"]
      FD["FaceLivenessDetector<br/>TF.js + face-api<br/>3s liveness check"]
      FP["Fingerprint UI<br/>capture + feedback"]
    end
  end

  subgraph Server["Next.js Server"]
    SA["Server Actions<br/>'use server'"]
    SVC["Business Services<br/>intake · pricing · membership"]
    SM["Session Machine<br/>status · audit · approvals"]
    SS["Session Store<br/>(in-memory → Prisma)"]
  end

  subgraph External["External Systems"]
    DB["Device Bridge Server<br/>fingerprint + face capture<br/>hardware SDKs"]

    DUKCAPIL["DUKCAPIL Database<br/>↳ Fingerprint Match<br/>↳ Identity Verification<br/>↳ NIK Lookup"]

    SIMKOPDES["SIMKOPDES Database<br/>↳ Face Recognition Match<br/>↳ Membership Status<br/>↳ Savings & Loan Records"]

    AI["AI Services<br/>Commodity Vision<br/>Market Prices"]
  end

  %% Client internal
  NextApp --> Pages
  NextApp --> State
  Pages --> Components

  %% Client → Server
  Pages -->|Server Actions| SA
  SA --> SVC
  SVC --> SM
  SM --> SS

  %% Client → External (direct browser APIs)
  FD -.->|getUserMedia| Camera["Webcam"]
  FP -.->|WebAuthn/USB| FingerprintHW["Fingerprint Scanner"]

  %% Server → External
  SA -->|POST /api/devices/*| DB
  DB -->|biometric template| DUKCAPIL
  DB -->|face embedding| SIMKOPDES
  SVC -.->|future: direct query| DUKCAPIL
  SVC -.->|future: direct query| SIMKOPDES
  SVC --> AI

  style Client fill:#1a202c,color:#fff
  style Server fill:#2d3748,color:#fff
  style External fill:#1a365d,color:#fff
  style DUKCAPIL fill:#276749,color:#fff
  style SIMKOPDES fill:#744210,color:#fff
```

```mermaid
---
title: Biometric Data Flow — Fingerprint & Face Matching
---
sequenceDiagram
  participant User as User
  participant Kiosk as Kiosk Browser
  participant Bridge as Device Bridge Server
  participant FPSDK as Fingerprint SDK
  participant FaceSDK as Face SDK
  participant Dukcapil as DUKCAPIL Database
  participant Simkopdes as SIMKOPDES Database
  participant App as KLIK-MP Server

  rect rgb(30, 41, 59)
    Note over User,App: FINGERPRINT FLOW
    User->>Kiosk: Tempel jari
    Kiosk->>FPSDK: capture fingerprint
    FPSDK-->>Kiosk: fingerprint template
    Kiosk->>Bridge: POST /api/devices/fingerprint
    Bridge->>FPSDK: verify quality
    FPSDK-->>Bridge: template OK
    Bridge->>Dukcapil: match fingerprint
    Dukcapil-->>Bridge: matched NIK + identity data
    Bridge-->>Kiosk: { verified: true, nik, nama }
    Kiosk->>App: Server Action: login/register
    App-->>Kiosk: session token
  end

  rect rgb(30, 41, 59)
    Note over User,App: FACE FLOW
    User->>Kiosk: Arahkan wajah ke kamera
    Kiosk->>Kiosk: TF.js face detection (3s liveness)
    Kiosk->>Kiosk: capture face image
    Kiosk->>Bridge: POST /api/devices/face-recognition
    Bridge->>FaceSDK: extract face embedding
    FaceSDK-->>Bridge: embedding vector
    Bridge->>Simkopdes: match face
    Simkopdes-->>Bridge: matched member ID + status
    Bridge-->>Kiosk: { verified: true, memberId, status }
    Kiosk->>App: Server Action: login/register/intake
  end
```

```mermaid
---
title: Feature Module Structure & Data Flow
---
graph LR
  subgraph Page["Page (thin)"]
    P["page.tsx<br/>composes components<br/>no business logic"]
  end

  subgraph Feature["Feature Module"]
    C["components/<br/>UI + state"]
    A["actions/<br/>server actions<br/>auth + validation boundary"]
    S["services/<br/>pure business logic"]
    SC["schemas/<br/>Zod validation"]
  end

  subgraph DataLayer["Data Layer"]
    DB["Prisma / Session Store"]
    EXT["External Systems<br/>Dukcapil · Simkopdes<br/>Device Bridge · AI"]
  end

  P -->|imports| C
  C -->|calls| A
  A -->|validates with| SC
  A -->|delegates to| S
  S -->|reads/writes| DB
  S -->|calls| EXT

  style Page fill:#2c3e50,color:#fff
  style Feature fill:#34495e,color:#fff
  style DataLayer fill:#2d3748,color:#fff
```

```mermaid
---
title: Session Lifecycle
---
stateDiagram-v2
  [*] --> DRAFT

  DRAFT --> IDENTITY_VERIFIED : fingerprint + face matched<br/>via Dukcapil & Simkopdes

  IDENTITY_VERIFIED --> MEMBERSHIP_READY : membership active<br/>(or settlement chosen)

  MEMBERSHIP_READY --> COMMODITY_CAPTURED : photo + weight captured

  COMMODITY_CAPTURED --> COMMODITY_ASSESSED : AI grades commodity

  COMMODITY_ASSESSED --> OFFER_CREATED : price calculated

  OFFER_CREATED --> NEGOTIATING : seller counteroffers

  NEGOTIATING --> AGREED : both parties accept

  AGREED --> COMPLETED : buyer + seller approve

  OFFER_CREATED --> REJECTED
  NEGOTIATING --> REJECTED
  DRAFT --> CANCELLED
  IDENTITY_VERIFIED --> CANCELLED
  MEMBERSHIP_READY --> CANCELLED
  COMMODITY_CAPTURED --> CANCELLED
  COMMODITY_ASSESSED --> CANCELLED
  OFFER_CREATED --> CANCELLED
  NEGOTIATING --> CANCELLED
```

## Architecture Summary

| Layer | Technology | Role |
|-------|-----------|------|
| **Client** | Next.js 16 + React 19 + Tailwind 4 | Kiosk & Operator UIs |
| **Face Auth** | TensorFlow.js + `@vladmandic/face-api` | Client-side liveness detection (3s hold) |
| **Server** | Next.js App Router + Server Actions | Business logic, validation, orchestration |
| **Hardware** | Device Bridge Server | Mediates fingerprint/face scanners |
| **Fingerprint DB** | **DUKCAPIL** | National ID fingerprint matching |
| **Face DB** | **SIMKOPDES** | Cooperative member face matching |
| **Session** | In-memory → Prisma/PostgreSQL | Status machine with audit trail |

### Key Principles

- **Fingerprint** captured via hardware scanner → matched against DUKCAPIL national database
- **Face** captured via browser webcam + TF.js liveness check → embedded → matched against SIMKOPDES member database
- **No plaintext biometric data** stored in KLIK-MP — only opaque references from external systems
- **Service layer** is pure business logic, testable without I/O
- **Server Actions** are the only boundary between client and server
- **Zod** validates every input before it reaches business logic
