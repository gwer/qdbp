import { describe, expect, it } from 'vitest';
import { makeT } from '@/i18n/t';
import de from './i18n/de.json';
import en from './i18n/en.json';
import es from './i18n/es.json';
import pt from './i18n/pt.json';
import ru from './i18n/ru.json';
import { def, refinance } from './tool';

// Эталоны — Python decimal.
describe('refinance', () => {
  it.each([
    [{ balance: 3000000, rate: 18, months: 180, newRate: 14, newMonths: 180, fees: 30000 }, 48312.63, 39952.24, 1474870.04, 4],
    [{ balance: 250000, rate: 7.5, months: 300, newRate: 6, newMonths: 300, fees: 4000 }, 1847.48, 1610.75, 67014.97, 17],
    [{ balance: 200000, rate: 4.5, months: 240, newRate: 3.5, newMonths: 240, fees: 2000 }, 1265.3, 1159.92, 23290.97, 19],
    [{ balance: 300000, rate: 12, months: 300, newRate: 10, newMonths: 300, fees: 3000 }, 3159.67, 2726.1, 127072.45, 7],
    [{ balance: 250000, rate: 7.5, months: 300, newRate: 6, newMonths: 360, fees: 4000 }, 1847.48, 1498.88, 10648.99, 12],
  ])('%o', (input, current, next, net, breakEven) => {
    const r = refinance(input);
    expect(r.currentPayment).toBeCloseTo(current, 2);
    expect(r.newPayment).toBeCloseTo(next, 2);
    expect(r.netSavings).toBeCloseTo(net, 2);
    expect(r.breakEven).toBe(breakEven);
  });

  it('платёж ниже, но из-за удлинения срока выходит дороже — не окупается', () => {
    const r = refinance({ balance: 1000000, rate: 12, months: 120, newRate: 11, newMonths: 240, fees: 0 });
    expect(r.monthlySaving).toBeGreaterThan(0);
    expect(r.netSavings).toBeLessThan(0);
    expect(r.breakEven).toBe(-2);
    expect(r.next.total - r.current.total).toBeCloseTo(-r.netSavings, 2);
  });

  it('без расходов — сразу, платёж не снизился — не окупается', () => {
    expect(refinance({ balance: 1000, rate: 10, months: 12, newRate: 9, newMonths: 12, fees: 0 }).breakEven).toBe(0);
    expect(refinance({ balance: 1000, rate: 10, months: 12, newRate: 12, newMonths: 12, fees: 50 }).breakEven).toBe(-1);
  });

  it('строки окупаемости есть во всех языках', () => {
    const spec = def.outputs.breakEven;
    if (spec?.type !== 'custom') throw new Error('breakEven должен быть custom');
    for (const [lang, dict] of Object.entries({ ru, en, es, de, pt })) {
      const ctx = { t: makeT(lang as 'ru', dict), lang: lang as 'ru', units: 'metric' as const, clock: '24' as const };
      for (const m of [-1, 0, 1, 2, 5, 21]) expect(spec.format(m, ctx)).toMatch(/\S/);
    }
  });
});
