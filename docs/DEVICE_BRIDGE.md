# Device Bridge Contract

## Purpose

The device bridge isolates vendor SDKs and local hardware drivers from the Next.js application. KLIK-MP calls the bridge through `/api/devices/[capability]`; browser clients never receive the bridge API key.

## Configuration

```text
DEVICE_BRIDGE_URL=https://device-bridge.example.internal
DEVICE_BRIDGE_API_KEY=<secret>
```

Use HTTPS outside an isolated local demo network. Do not commit the API key.

## Capabilities

The proxy allowlist contains:

- `fingerprint`
- `face-recognition`
- `commodity-vision`
- `market-price`
- `scale`

Requests use `POST`, `content-type: application/json`, a maximum declared body size of 10 MB, and a 30-second upstream timeout. The bridge should return JSON and preserve meaningful 4xx/5xx status codes.

## Operational requirements

- Device identity and workstation binding must be enforced by the bridge.
- Biometric templates should remain in the approved biometric system; KLIK-MP should receive match decisions and opaque references, not raw templates.
- Photos must follow the retention and consent policy selected by the cooperative.
- Every response should include a correlation ID suitable for audit trails.
- The bridge must not downgrade to mock data when a real device is offline.
- Health checks and vendor-specific payloads must be documented before final hardware acceptance.

Feature-specific request and response payloads are defined in each document under `docs/contracts/`.

## Hardware acceptance gate

Real-demo readiness cannot be approved until the device models, vendor SDK versions, operating system, connection protocol, and AI model endpoints are known and tested on the target kiosk. Generic HTTP adapters provide a production integration boundary, not proof that an unspecified device is compatible.
