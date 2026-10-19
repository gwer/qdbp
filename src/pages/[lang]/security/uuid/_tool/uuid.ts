const hex = (b: number) => b.toString(16).padStart(2, '0');

export function formatUuid(bytes: Uint8Array, upper = false, hyphens = true): string {
  const h = [...bytes].map(hex).join('');
  const s = hyphens ? `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}` : h;
  return upper ? s.toUpperCase() : s;
}

/** UUID v4 (RFC 9562): 122 случайных бита. random — 16 случайных байт. */
export function uuidV4(random: Uint8Array): Uint8Array {
  const b = Uint8Array.from(random);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  return b;
}

/** UUID v7 (RFC 9562): 48 бит — время в мс от эпохи Unix, остальное случайно; сортируется по времени. */
export function uuidV7(ms: number, random: Uint8Array): Uint8Array {
  const b = Uint8Array.from(random);
  let t = ms;
  for (let i = 5; i >= 0; i--) {
    b[i] = t % 256;
    t = Math.floor(t / 256);
  }
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  return b;
}

/** Время создания из UUID v7, мс. */
export const v7Time = (uuid: string) => parseInt(uuid.replace(/-/g, '').slice(0, 12), 16);
