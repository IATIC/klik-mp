import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("device bridge route", () => {
  it("rejects unsupported capabilities", async () => {
    const response = await POST(
      new Request("http://localhost/api/devices/unknown", {
        method: "POST",
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ capability: "unknown" }) },
    );

    expect(response.status).toBe(404);
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/devices/fingerprint", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not-json",
      }),
      { params: Promise.resolve({ capability: "fingerprint" }) },
    );

    expect(response.status).toBe(400);
  });

  it("reports an unavailable real bridge without falling back to mocks", async () => {
    vi.stubEnv("DEVICE_BRIDGE_URL", "");

    const response = await POST(
      new Request("http://localhost/api/devices/face-recognition", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ probe: "sample" }),
      }),
      { params: Promise.resolve({ capability: "face-recognition" }) },
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/belum dikonfigurasi/i),
    });
  });

  it("forwards allowlisted payloads and keeps the bridge credential server-side", async () => {
    vi.stubEnv("DEVICE_BRIDGE_URL", "https://bridge.internal/");
    vi.stubEnv("DEVICE_BRIDGE_API_KEY", "server-secret");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "VERIFIED" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost/api/devices/fingerprint", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ requestId: "req-1" }),
      }),
      { params: Promise.resolve({ capability: "fingerprint" }) },
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://bridge.internal/fingerprint",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer server-secret",
        }),
        body: JSON.stringify({ requestId: "req-1" }),
        cache: "no-store",
      }),
    );
  });
});
