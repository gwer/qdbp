import { expect } from 'vitest';
import type { Dict } from '@/i18n/t';
import { flattenKeys, requiredToolKeys } from '@/lib/validate';
import type { CalculatorDef } from '@/ui/define';

/**
 * Для инструментов на localizedCalculator сборка проверяет только title/description
 * (формально это свой компонент), поэтому подписи полей и результатов проверяем тестом.
 */
export function expectAllKeys(base: CalculatorDef<any, any>, dicts: Record<string, Dict>) {
  for (const [lang, dict] of Object.entries(dicts)) {
    const keys = new Set(flattenKeys(dict));
    const missing = requiredToolKeys(base).filter((k) => !keys.has(k));
    expect(missing, lang).toEqual([]);
  }
}
