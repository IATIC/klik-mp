import type { ScaleAdapter } from "../types/commodity-capture";

type SerialReader = {
  read(): Promise<{ value?: Uint8Array; done: boolean }>;
  cancel(): Promise<void>;
  releaseLock(): void;
};

type SerialWriter = {
  write(value: Uint8Array): Promise<void>;
  releaseLock(): void;
};

type SerialPortLike = {
  readable: { getReader(): SerialReader } | null;
  writable: { getWriter(): SerialWriter } | null;
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
};

type SerialNavigatorLike = {
  requestPort(options?: {
    filters?: Array<{ usbVendorId?: number; usbProductId?: number }>;
  }): Promise<SerialPortLike>;
};

export type WebSerialScaleProtocol = {
  baudRate: number;
  grossCommand: string;
  tareCommand: string;
  responseTerminator?: string;
  timeoutMs?: number;
  parseWeight?: (response: string) => number;
  filters?: Array<{ usbVendorId?: number; usbProductId?: number }>;
};

const DEFAULT_TERMINATOR = "\n";

function defaultParseWeight(response: string): number {
  const match = response.replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  const value = match ? Number(match[0]) : Number.NaN;

  if (!Number.isFinite(value)) {
    throw new Error("Respons timbangan tidak memuat nilai berat yang valid.");
  }

  return value;
}

function browserSerial(): SerialNavigatorLike | undefined {
  if (typeof navigator === "undefined") return undefined;

  return (navigator as Navigator & { serial?: SerialNavigatorLike }).serial;
}

export class WebSerialScaleAdapter implements ScaleAdapter {
  private port: SerialPortLike | null = null;
  private responseBuffer = "";

  constructor(
    private readonly protocol: WebSerialScaleProtocol,
    private readonly serial: SerialNavigatorLike | undefined = browserSerial(),
  ) {}

  async connect(): Promise<void> {
    if (!this.serial) {
      throw new Error(
        "Web Serial tidak tersedia. Gunakan browser Chromium melalui HTTPS atau localhost.",
      );
    }

    this.port = await this.serial.requestPort({ filters: this.protocol.filters });
    await this.port.open({ baudRate: this.protocol.baudRate });
  }

  readGrossWeight(): Promise<number> {
    return this.query(this.protocol.grossCommand);
  }

  readTareWeight(): Promise<number> {
    return this.query(this.protocol.tareCommand);
  }

  async disconnect(): Promise<void> {
    if (!this.port) return;

    await this.port.close();
    this.port = null;
    this.responseBuffer = "";
  }

  private async query(command: string): Promise<number> {
    if (!this.port?.readable || !this.port.writable) {
      throw new Error("Timbangan belum terhubung.");
    }

    const writer = this.port.writable.getWriter();
    try {
      await writer.write(new TextEncoder().encode(command));
    } finally {
      writer.releaseLock();
    }

    const response = await this.readResponse();
    return (this.protocol.parseWeight ?? defaultParseWeight)(response);
  }

  private async readResponse(): Promise<string> {
    if (!this.port?.readable) {
      throw new Error("Kanal baca timbangan tidak tersedia.");
    }

    const terminator = this.protocol.responseTerminator ?? DEFAULT_TERMINATOR;
    const deadline = Date.now() + (this.protocol.timeoutMs ?? 4_000);
    const reader = this.port.readable.getReader();

    try {
      while (Date.now() < deadline) {
        const remainingMs = Math.max(1, deadline - Date.now());
        const chunk = await Promise.race([
          reader.read(),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Pembacaan timbangan melewati batas waktu.")),
              remainingMs,
            ),
          ),
        ]);

        if (chunk.done) break;
        this.responseBuffer += new TextDecoder().decode(chunk.value, {
          stream: true,
        });
        const terminatorIndex = this.responseBuffer.indexOf(terminator);

        if (terminatorIndex >= 0) {
          const response = this.responseBuffer.slice(0, terminatorIndex).trim();
          this.responseBuffer = this.responseBuffer.slice(
            terminatorIndex + terminator.length,
          );
          return response;
        }
      }
    } catch (error) {
      await reader.cancel().catch(() => undefined);
      throw error;
    } finally {
      reader.releaseLock();
    }

    throw new Error("Respons timbangan berakhir sebelum data berat diterima.");
  }
}

