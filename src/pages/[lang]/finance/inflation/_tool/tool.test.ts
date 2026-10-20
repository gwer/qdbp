import { describe, expect, it } from 'vitest';
import { inflation } from './tool';

// Эталоны — Python.
describe('inflation', () => {
  it.each([
    [100000, 8, 10, 215892.49972727883, 46319.348808468414, 53.68065119153158],
    [1000, 3, 10, 1343.9163793441223, 744.093914896725, 25.590608510327506],
    [1000, 2.5, 10, 1280.0845441963565, 781.1984017257273, 21.88015982742727],
  ])('%d при %d%% за %d лет', (amount, rate, years, future, power, loss) => {
    const r = inflation(amount, rate, years);
    expect(r.future).toBeCloseTo(future, 6);
    expect(r.power).toBeCloseTo(power, 6);
    expect(r.loss).toBeCloseTo(loss, 6);
  });

  it('ноль лет — без изменений', () => {
    expect(inflation(500, 5, 0)).toEqual({ future: 500, power: 500, loss: 0 });
  });
});
