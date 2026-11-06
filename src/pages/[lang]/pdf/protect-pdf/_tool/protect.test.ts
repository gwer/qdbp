import { expect, test } from 'vitest';
import { PDFDocument, StandardFonts } from '@cantoo/pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { protect } from './protect';

const sample = async () => {
  const d = await PDFDocument.create();
  d.addPage().drawText('Top secret', { x: 50, y: 700, font: await d.embedFont(StandardFonts.Helvetica) });
  return d.save();
};
const open = async (bytes: Uint8Array, password?: string) => {
  const doc = await getDocument({ data: bytes.slice(), password, verbosity: 0 }).promise;
  const text = (await (await doc.getPage(1)).getTextContent()).items.map((i) => ('str' in i ? i.str : '')).join('');
  return { text, perms: await doc.getPermissions() };
};

test('без пароля не открывается, с паролем — текст на месте и всё разрешено', async () => {
  const out = await protect(await sample(), undefined, 'пароль-1', '', { print: false, copy: false, edit: false });
  await expect(open(out)).rejects.toMatchObject({ name: 'PasswordException' });
  await expect(open(out, 'wrong')).rejects.toMatchObject({ name: 'PasswordException' });
  const r = await open(out, 'пароль-1');
  expect(r.text).toBe('Top secret');
  // PermissionFlag: PRINT = 4, MODIFY_CONTENTS = 8, COPY = 16.
  expect([...(r.perms ?? [])]).toEqual(expect.arrayContaining([4, 8, 16]));
});

test('ограничения действуют для пароля открытия', async () => {
  const out = await protect(await sample(), undefined, 'user', 'owner', { print: true, copy: true, edit: false });
  const r = await open(out, 'user');
  expect(r.text).toBe('Top secret');
  const perms = [...(r.perms ?? [])];
  expect(perms).not.toContain(4);
  expect(perms).not.toContain(16);
  expect(perms).toContain(8);
});
