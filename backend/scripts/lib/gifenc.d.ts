// gifenc ne publie pas de types (voir README) — déclaration minimale
// couvrant l'API utilisée par gif.ts.
declare module 'gifenc' {
  export type RgbColor = [number, number, number];
  export type RgbaColor = [number, number, number, number];

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: Record<string, unknown>
  ): RgbColor[] | RgbaColor[];

  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: RgbColor[] | RgbaColor[],
    format?: string
  ): Uint8Array;

  export interface GIFEncoderWriteFrameOptions {
    palette?: RgbColor[] | RgbaColor[];
    first?: boolean;
    transparent?: boolean;
    transparentIndex?: number;
    delay?: number;
    repeat?: number;
    dispose?: number;
  }

  export interface GIFEncoderInstance {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: GIFEncoderWriteFrameOptions): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
  }

  export function GIFEncoder(options?: { auto?: boolean; initialCapacity?: number }): GIFEncoderInstance;
}
