import { z } from "zod";

import type { ScaleAdapter } from "../types/commodity-capture";

const bridgeResponseSchema = z.object({
  weight: z.number().finite().optional(),
});

export type HttpScaleDeviceBridgeOptions = {
  endpoint?: string;
  headers?: Record<string, string>;
  fetchImplementation?: typeof fetch;
};

type ScaleBridgeAction = "connect" | "read_gross" | "read_tare" | "disconnect";

export class HttpScaleDeviceBridgeAdapter implements ScaleAdapter {
  private readonly endpoint: string;
  private readonly headers: Record<string, string>;
  private readonly fetchImplementation: typeof fetch;

  constructor(options: HttpScaleDeviceBridgeOptions = {}) {
    this.endpoint = options.endpoint ?? "/api/devices/scale";
    this.headers = options.headers ?? {};
    this.fetchImplementation = options.fetchImplementation ?? fetch;
  }

  async connect(): Promise<void> {
    await this.request("connect");
  }

  async readGrossWeight(): Promise<number> {
    const response = await this.request("read_gross");
    if (response.weight === undefined) {
      throw new Error("Device bridge tidak mengembalikan berat gross.");
    }
    return response.weight;
  }

  async readTareWeight(): Promise<number> {
    const response = await this.request("read_tare");
    if (response.weight === undefined) {
      throw new Error("Device bridge tidak mengembalikan berat tare.");
    }
    return response.weight;
  }

  async disconnect(): Promise<void> {
    await this.request("disconnect");
  }

  private async request(action: ScaleBridgeAction) {
    const response = await this.fetchImplementation(this.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", ...this.headers },
      body: JSON.stringify({ action }),
    });

    if (!response.ok) {
      throw new Error(`Device bridge timbangan gagal (${response.status}).`);
    }

    return bridgeResponseSchema.parse(await response.json());
  }
}

