import {
  marketPriceQuerySchema,
  marketPriceReferenceSchema,
} from "../schemas/pricing";
import type {
  MarketPriceAdapter,
  MarketPriceQuery,
  MarketPriceReference,
} from "../types/contracts";

type Fetcher = typeof fetch;

export type HttpMarketPriceAdapterConfig = {
  endpoint: string;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  timeoutMs?: number;
  fetcher?: Fetcher;
  responseMapper?: (
    payload: unknown,
    query: MarketPriceQuery,
  ) => MarketPriceReference;
};

function defaultResponseMapper(
  payload: unknown,
  query: MarketPriceQuery,
): MarketPriceReference {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("Respons sumber harga pasar tidak berbentuk objek.");
  }

  const value = payload as Record<string, unknown>;
  return marketPriceReferenceSchema.parse({
    referencePrice: value.referencePrice,
    commodityType: value.commodityType ?? query.commodityType,
    qualityGrade: value.qualityGrade ?? query.qualityGrade,
    market: value.market ?? query.market ?? "Pasar acuan",
    unit: value.unit ?? query.unit ?? "kg",
    currency: value.currency ?? "IDR",
    observedAt: value.observedAt,
    source: value.source,
  });
}

export class HttpMarketPriceAdapter implements MarketPriceAdapter {
  private readonly config: Required<
    Pick<HttpMarketPriceAdapterConfig, "endpoint" | "timeoutMs" | "fetcher">
  > &
    Omit<HttpMarketPriceAdapterConfig, "endpoint" | "timeoutMs" | "fetcher">;

  constructor(config: HttpMarketPriceAdapterConfig) {
    this.config = {
      ...config,
      endpoint: config.endpoint,
      timeoutMs: config.timeoutMs ?? 8_000,
      fetcher: config.fetcher ?? fetch,
    };
  }

  async getReferencePrice(
    unsafeQuery: MarketPriceQuery,
  ): Promise<MarketPriceReference> {
    const query = marketPriceQuerySchema.parse(unsafeQuery);
    const method = this.config.method ?? "POST";
    const requestUrl =
      method === "GET" ? withQuery(this.config.endpoint, query) : this.config.endpoint;

    const response = await this.config.fetcher(requestUrl, {
      method,
      headers: {
        Accept: "application/json",
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
        ...this.config.headers,
      },
      ...(method === "POST" ? { body: JSON.stringify(query) } : {}),
      signal: AbortSignal.timeout(this.config.timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`Sumber harga pasar merespons HTTP ${response.status}.`);
    }

    const payload: unknown = await response.json();
    const mapper = this.config.responseMapper ?? defaultResponseMapper;
    return marketPriceReferenceSchema.parse(mapper(payload, query));
  }
}

function withQuery(endpoint: string, query: MarketPriceQuery) {
  const base = endpoint.startsWith("/") ? "http://local.invalid" : undefined;
  const url = new URL(endpoint, base);
  url.searchParams.set("commodityType", query.commodityType);
  url.searchParams.set("qualityGrade", query.qualityGrade);
  url.searchParams.set("unit", query.unit ?? "kg");
  if (query.market) url.searchParams.set("market", query.market);
  return base ? `${url.pathname}${url.search}` : url.toString();
}

export function createLocalMarketPriceAdapter(fetcher?: Fetcher) {
  return new HttpMarketPriceAdapter({
    endpoint: "/api/devices/market-price",
    method: "POST",
    ...(fetcher ? { fetcher } : {}),
  });
}

export type MockMarketPriceAdapterConfig = {
  references: MarketPriceReference[];
  fallback?: MarketPriceReference;
};

export class MockMarketPriceAdapter implements MarketPriceAdapter {
  constructor(private readonly config: MockMarketPriceAdapterConfig) {}

  async getReferencePrice(
    unsafeQuery: MarketPriceQuery,
  ): Promise<MarketPriceReference> {
    const query = marketPriceQuerySchema.parse(unsafeQuery);
    const match = this.config.references.find(
      (reference) =>
        reference.commodityType === query.commodityType &&
        reference.qualityGrade === query.qualityGrade &&
        (!query.market || reference.market === query.market) &&
        reference.unit === query.unit,
    );
    const reference = match ?? this.config.fallback;
    if (!reference) {
      throw new Error("Referensi harga pasar tidak ditemukan pada mock adapter.");
    }
    return marketPriceReferenceSchema.parse(reference);
  }
}
