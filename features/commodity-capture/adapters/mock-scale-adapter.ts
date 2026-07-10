import type { ScaleAdapter } from "../types/commodity-capture";

export type MockScaleOptions = {
  grossWeight?: number;
  tareWeight?: number;
  error?: Error;
};

export class MockScaleAdapter implements ScaleAdapter {
  private connected = false;

  constructor(private readonly options: MockScaleOptions = {}) {}

  async connect(): Promise<void> {
    if (this.options.error) throw this.options.error;
    this.connected = true;
  }

  async readGrossWeight(): Promise<number> {
    this.assertConnected();
    return this.options.grossWeight ?? 25;
  }

  async readTareWeight(): Promise<number> {
    this.assertConnected();
    return this.options.tareWeight ?? 1;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  private assertConnected(): void {
    if (!this.connected) throw new Error("Mock timbangan belum terhubung.");
  }
}

