import { describe, expect, it, vi } from "vitest";

import {
  HttpFaceRecognitionAdapter,
  HttpFingerprintAdapter,
} from "@/features/identity-membership";

describe("HTTP device bridge adapters", () => {
  it("mengirim envelope fingerprint ke route proxy default", async () => {
    const fetchMock = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body)) as { requestId: string };

      return new Response(
        JSON.stringify({
          protocolVersion: "1.0",
          requestId: request.requestId,
          status: "VERIFIED",
          result: {
            sellerId: "seller-001",
            captureId: "capture-fingerprint-001",
            confidence: 0.98,
            verifiedAt: "2026-07-10T08:00:00.000Z",
            deviceId: "bridge-fingerprint-01",
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    });
    const adapter = new HttpFingerprintAdapter({
      baseUrl: "http://localhost:3000",
      fetchImpl: fetchMock as unknown as typeof fetch,
      requestIdFactory: () => "request-001",
    });

    const result = await adapter.verify({
      sessionId: "session-001",
      sellerIdHint: "seller-001",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/devices/fingerprint",
      expect.objectContaining({ method: "POST" }),
    );
    expect(
      JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)),
    ).toMatchObject({
      protocolVersion: "1.0",
      requestId: "request-001",
      operation: "VERIFY_FINGERPRINT",
      sessionId: "session-001",
      sellerIdHint: "seller-001",
    });
    expect(result).toMatchObject({
      modality: "FINGERPRINT",
      verified: true,
      sellerId: "seller-001",
    });
  });

  it("mendukung endpoint face recognition yang dapat dikonfigurasi", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          protocolVersion: "1.0",
          requestId: "face-request-001",
          status: "NOT_VERIFIED",
          result: {
            captureId: "capture-face-001",
            confidence: 0.31,
            verifiedAt: "2026-07-10T08:00:00.000Z",
          },
        }),
        { status: 200 },
      ),
    );
    const adapter = new HttpFaceRecognitionAdapter({
      baseUrl: "http://bridge.local",
      endpoint: "/custom/face/verify",
      fetchImpl: fetchMock as unknown as typeof fetch,
      requestIdFactory: () => "face-request-001",
    });

    const result = await adapter.verify({ sessionId: "session-002" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://bridge.local/custom/face/verify",
      expect.any(Object),
    );
    expect(result).toMatchObject({ modality: "FACE", verified: false });
  });

  it("menolak response yang tidak berkorelasi dengan request", async () => {
    const adapter = new HttpFingerprintAdapter({
      baseUrl: "http://localhost:3000",
      fetchImpl: vi.fn(async () =>
        new Response(
          JSON.stringify({
            protocolVersion: "1.0",
            requestId: "different-request",
            status: "NOT_VERIFIED",
            result: { verifiedAt: "2026-07-10T08:00:00.000Z" },
          }),
          { status: 200 },
        ),
      ) as unknown as typeof fetch,
      requestIdFactory: () => "request-expected",
    });

    await expect(adapter.verify({ sessionId: "session-003" })).rejects.toEqual(
      expect.objectContaining({
        code: "DEVICE_RESPONSE_INVALID",
        retryable: false,
      }),
    );
  });
});
