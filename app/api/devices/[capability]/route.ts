import { NextResponse } from "next/server";
import { z } from "zod";

const allowedCapabilities = new Set([
  "fingerprint",
  "face-recognition",
  "commodity-vision",
  "market-price",
  "scale",
]);

const bridgePayloadSchema = z.record(z.string(), z.unknown());

type RouteContext = {
  params: Promise<{ capability: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { capability } = await context.params;

  if (!allowedCapabilities.has(capability)) {
    return NextResponse.json(
      { error: "Kapabilitas perangkat tidak didukung." },
      { status: 404 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Payload perangkat melebihi batas 10 MB." },
      { status: 413 },
    );
  }

  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Payload perangkat harus berupa JSON." },
      { status: 400 },
    );
  }

  const parsedPayload = bridgePayloadSchema.safeParse(requestBody);
  if (!parsedPayload.success) {
    return NextResponse.json(
      { error: "Payload perangkat tidak valid." },
      { status: 400 },
    );
  }

  if (JSON.stringify(parsedPayload.data).length > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Payload perangkat melebihi batas 10 MB." },
      { status: 413 },
    );
  }

  const bridgeUrl = process.env.DEVICE_BRIDGE_URL?.replace(/\/$/, "");
  if (!bridgeUrl) {
    return NextResponse.json(
      {
        error:
          "Device bridge belum dikonfigurasi. Gunakan mock hanya untuk development atau testing.",
      },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(`${bridgeUrl}/${capability}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.DEVICE_BRIDGE_API_KEY
          ? { authorization: `Bearer ${process.env.DEVICE_BRIDGE_API_KEY}` }
          : {}),
      },
      body: JSON.stringify(parsedPayload.data),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });

    const responseText = await response.text();
    let responseBody: unknown;

    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = { error: "Respons device bridge bukan JSON yang valid." };
    }

    return NextResponse.json(responseBody, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "Device bridge tidak dapat dihubungi." },
      { status: 502 },
    );
  }
}
