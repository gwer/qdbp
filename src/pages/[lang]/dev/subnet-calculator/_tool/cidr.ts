// IPv4 и подсети (CIDR). Адрес хранится как беззнаковое 32-битное число.

export function parseIp(s: string): number | null {
  const parts = s.trim().split('.');
  if (parts.length !== 4 || parts.some((p) => !/^(0|[1-9]\d{0,2})$/.test(p) || Number(p) > 255)) return null;
  return parts.reduce((acc, p) => acc * 256 + Number(p), 0);
}

export const formatIp = (n: number) => [24, 16, 8, 0].map((sh) => Math.floor(n / 2 ** sh) % 256).join('.');

const maskOf = (prefix: number) => (prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0);

/** «192.168.1.10/24», «10.0.0.0 255.255.0.0» или просто адрес (тогда /32). */
export function parseCidr(input: string): { ip: number; prefix: number } | null {
  const s = input.trim();
  const slash = /^([\d.]+)\s*\/\s*(\d{1,2})$/.exec(s);
  if (slash) {
    const ip = parseIp(slash[1]);
    const prefix = Number(slash[2]);
    return ip === null || prefix > 32 ? null : { ip, prefix };
  }
  const withMask = /^([\d.]+)\s+([\d.]+)$/.exec(s);
  if (withMask) {
    const ip = parseIp(withMask[1]);
    const mask = parseIp(withMask[2]);
    if (ip === null || mask === null) return null;
    const prefix = 32 - Math.log2(((~mask >>> 0) + 1) || 2 ** 32);
    return Number.isInteger(prefix) && maskOf(prefix) === mask ? { ip, prefix } : null;
  }
  const ip = parseIp(s);
  return ip === null ? null : { ip, prefix: 32 };
}

export function subnet(ip: number, prefix: number) {
  const mask = maskOf(prefix);
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const size = 2 ** (32 - prefix);
  // /31 (RFC 3021) и /32 — без адреса сети и широковещательного.
  const usable = prefix >= 31 ? size : size - 2;
  return {
    network,
    broadcast,
    mask,
    wildcard: ~mask >>> 0,
    first: prefix >= 31 ? network : network + 1,
    last: prefix >= 31 ? broadcast : broadcast - 1,
    size,
    usable,
    private: [
      [0x0a000000, 8],
      [0xac100000, 12],
      [0xc0a80000, 16],
    ].some(([net, p]) => ((ip & maskOf(p)) >>> 0) === net),
  };
}
