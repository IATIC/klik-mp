import { commodityVisionPredictionSchema } from "../schemas/commodity-assessment";
import type {
  CommodityVisionAdapter,
  CommodityVisionInput,
  CommodityVisionPrediction,
} from "../types/commodity-assessment";

export type HttpCommodityVisionOptions = {
  endpoint?: string;
  headers?: Record<string, string>;
  fetchImplementation?: typeof fetch;
};

export class HttpCommodityVisionAdapter implements CommodityVisionAdapter {
  private readonly endpoint: string;
  private readonly headers: Record<string, string>;
  private readonly fetchImplementation: typeof fetch;

  constructor(options: HttpCommodityVisionOptions = {}) {
    this.endpoint = options.endpoint ?? "/api/devices/commodity-vision";
    this.headers = options.headers ?? {};
    this.fetchImplementation = options.fetchImplementation ?? fetch;
  }

  async assess(input: CommodityVisionInput): Promise<CommodityVisionPrediction> {
    const response = await this.fetchImplementation(this.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", ...this.headers },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Layanan AI komoditas gagal (${response.status}).`);
    }

    return commodityVisionPredictionSchema.parse(await response.json());
  }
}

