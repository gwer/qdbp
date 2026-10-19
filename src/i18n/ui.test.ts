import { expect, it } from 'vitest';
import { validateFiles } from '@/lib/validate';
import { UI } from './ui';

it('общие строки интерфейса: одинаковые ключи на всех языках', () => {
  expect(validateFiles('i18n/ui', { i18n: UI, content: [] }, [], false)).toEqual([]);
});
