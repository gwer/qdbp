/**
 * НДФЛ для налоговых резидентов РФ с трудовых доходов, шкала с 2025 года.
 * [порог годового дохода, ставка сверх порога]. Северные надбавки и районные коэффициенты не учитываются.
 */
const SCALE = [
  [0, 0.13],
  [2_400_000, 0.15],
  [5_000_000, 0.18],
  [20_000_000, 0.2],
  [50_000_000, 0.22],
] as const;

/** Налог с дохода нарастающим итогом с начала года, в рублях (до округления). */
export function annualTax(income: number): number {
  let tax = 0;
  for (let i = 0; i < SCALE.length; i++) {
    const [from, rate] = SCALE[i];
    const to = SCALE[i + 1]?.[0] ?? Infinity;
    if (income > from) tax += (Math.min(income, to) - from) * rate;
  }
  return tax;
}

/** НДФЛ исчисляется в полных рублях: меньше 50 копеек отбрасывается, 50 и больше — до рубля. */
const rubles = (n: number) => Math.round(n);

export interface MonthRow {
  n: number;
  gross: number;
  tax: number;
  net: number;
}

/** Помесячное удержание при одинаковом окладе: налог с накопленного дохода минус уже удержанный. */
export function salaryYear(gross: number) {
  const months: MonthRow[] = [];
  let withheld = 0;
  for (let n = 1; n <= 12; n++) {
    const tax = rubles(annualTax(gross * n)) - withheld;
    withheld += tax;
    months.push({ n, gross, tax, net: gross - tax });
  }
  const yearGross = gross * 12;
  // В месяц — в среднем за год: при доходе выше 2,4 млн в год удержание растёт к концу года.
  return {
    net: (yearGross - withheld) / 12,
    tax: withheld / 12,
    yearNet: yearGross - withheld,
    yearTax: withheld,
    rate: (withheld / yearGross) * 100,
    months,
  };
}

/** Оклад в целых рублях, при котором средняя зарплата на руки за год не меньше net. */
export function grossFromNet(net: number): number {
  let lo = net;
  let hi = net / 0.78 + 1;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (mid * 12 - annualTax(mid * 12) < net * 12) lo = mid;
    else hi = mid;
  }
  return Math.ceil(hi - 1e-6);
}
