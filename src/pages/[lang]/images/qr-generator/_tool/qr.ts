import qrcode from 'qrcode-generator';

export type Level = 'L' | 'M' | 'Q' | 'H';

/**
 * Матрица QR-кода. Текст кодируется в UTF-8: библиотека по умолчанию берёт от каждого символа
 * только младший байт, поэтому передаём ей «бинарную» строку из байтов UTF-8.
 */
export function qrMatrix(text: string, level: Level): boolean[][] {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  const qr = qrcode(0, level);
  qr.addData(binary, 'Byte');
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
}

/** SVG с отступом (quiet zone) 4 модуля, как требует стандарт. */
export function qrSvg(m: boolean[][], fg = '#000000', bg = '#ffffff', margin = 4): string {
  const size = m.length + margin * 2;
  let path = '';
  m.forEach((row, r) => row.forEach((dark, c) => dark && (path += `M${c + margin},${r + margin}h1v1h-1z`)));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="${bg}"/><path d="${path}" fill="${fg}"/></svg>`;
}

/** Экранирование для формата Wi-Fi: \ ; , : " */
const esc = (s: string) => s.replace(/([\;,:"])/g, '\\$1');

export function wifiPayload(ssid: string, password: string, security: 'WPA' | 'WEP' | 'nopass', hidden: boolean): string {
  const pass = security === 'nopass' ? '' : `P:${esc(password)};`;
  return `WIFI:T:${security};S:${esc(ssid)};${pass}${hidden ? 'H:true;' : ''};`;
}
