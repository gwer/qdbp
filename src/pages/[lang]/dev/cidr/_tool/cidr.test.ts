import { describe, expect, it } from 'vitest';
import { formatIp, parseCidr, parseIp, subnet } from './cidr';

// Эталоны — Python ipaddress.
describe('cidr', () => {
  it('разбор адресов', () => {
    expect(parseIp('192.168.1.10')).toBe(3232235786);
    expect(formatIp(3232235786)).toBe('192.168.1.10');
    for (const bad of ['256.1.1.1', '1.2.3', '01.2.3.4', 'a.b.c.d']) expect(parseIp(bad)).toBeNull();
  });

  it('форматы ввода', () => {
    expect(parseCidr('192.168.1.10/24')).toEqual({ ip: 3232235786, prefix: 24 });
    expect(parseCidr('10.0.0.0 255.255.0.0')).toEqual({ ip: 167772160, prefix: 16 });
    expect(parseCidr('10.0.0.0 255.0.255.0')).toBeNull();
    expect(parseCidr('8.8.8.8')).toEqual({ ip: 134744072, prefix: 32 });
    expect(parseCidr('1.1.1.1/33')).toBeNull();
  });

  it('192.168.1.10/24', () => {
    const s = subnet(3232235786, 24);
    expect([s.network, s.broadcast, s.mask, s.wildcard, s.first, s.last].map(formatIp)).toEqual([
      '192.168.1.0', '192.168.1.255', '255.255.255.0', '0.0.0.255', '192.168.1.1', '192.168.1.254',
    ]);
    expect([s.size, s.usable, s.private]).toEqual([256, 254, true]);
  });

  it('/20, /31, /32, /0', () => {
    const a = subnet(parseIp('172.20.37.5')!, 20);
    expect([formatIp(a.network), formatIp(a.broadcast), a.usable]).toEqual(['172.20.32.0', '172.20.47.255', 4094]);
    expect(subnet(parseIp('10.0.0.1')!, 31)).toMatchObject({ usable: 2, size: 2 });
    expect(subnet(parseIp('8.8.8.8')!, 32)).toMatchObject({ usable: 1, private: false });
    expect(subnet(parseIp('8.8.8.8')!, 0)).toMatchObject({ size: 4294967296, network: 0 });
  });
});
