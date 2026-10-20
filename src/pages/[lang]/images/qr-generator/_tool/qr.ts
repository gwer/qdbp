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

/** Письмо: mailto: с темой и текстом (кодируются как параметры URL). */
export function emailPayload(to: string, subject: string, body: string): string {
  const q = [subject && `subject=${encodeURIComponent(subject)}`, body && `body=${encodeURIComponent(body)}`].filter(Boolean).join('&');
  return `mailto:${to.trim()}${q ? `?${q}` : ''}`;
}

/** Звонок: tel: без пробелов, скобок и дефисов. */
export const telPayload = (phone: string) => `tel:${phone.replace(/[\s()-]/g, '')}`;

/** SMS: формат SMSTO:номер:текст — его понимают камеры iOS и Android. */
export const smsPayload = (phone: string, text: string) => `SMSTO:${phone.replace(/[\s()-]/g, '')}:${text}`;

const vEsc = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

/** Визитка vCard 3.0: при сканировании телефон предлагает сохранить контакт. */
export function vcardPayload(c: { first: string; last: string; phone: string; email: string; org: string; url: string }): string {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${vEsc(c.last)};${vEsc(c.first)};;;`, `FN:${vEsc([c.first, c.last].filter(Boolean).join(' '))}`];
  if (c.org) lines.push(`ORG:${vEsc(c.org)}`);
  if (c.phone) lines.push(`TEL;TYPE=CELL:${c.phone.replace(/[\s()-]/g, '')}`);
  if (c.email) lines.push(`EMAIL:${c.email.trim()}`);
  if (c.url) lines.push(`URL:${c.url.trim()}`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

/** Относительная яркость цвета #rrggbb по WCAG. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Проблема с цветами: светлый код на тёмном фоне многие сканеры не читают (inverted),
 * а при контрасте ниже 4:1 код может не распознаться при плохом освещении (low).
 */
export function colorProblem(fg: string, bg: string): 'inverted' | 'low' | null {
  const lf = luminance(fg);
  const lb = luminance(bg);
  if (lf > lb) return 'inverted';
  return (lb + 0.05) / (lf + 0.05) < 4 ? 'low' : null;
}
