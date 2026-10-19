import type { ComponentType } from 'preact';
import type { Lang } from '@/i18n/config';
import type { T } from '@/i18n/t';
import type { NumberKind } from '@/lib/format';

export type NumberInput = {
  type: 'number' | 'integer' | 'percent';
  default: number;
  min?: number;
  max?: number;
};
export type SelectInput = { type: 'select'; options: readonly string[]; default: string };
/** default: 'YYYY-MM-DD', 'today', 'today+N', 'today-N'. «Сегодня» подставляется только в браузере. */
export type DateInput = { type: 'date'; default: string };
/** Длительность «ч:мм»; default и значение — в минутах. */
export type DurationInput = { type: 'duration'; default: number };
/** Время на часах; default: 'HH:MM' или 'now' (только в браузере); значение — минуты от полуночи. */
export type TimeInput = { type: 'time'; default: string };
export type InputSpec = NumberInput | SelectInput | DateInput | DurationInput | TimeInput;

export type OutputSpec =
  | { type?: NumberKind; digits?: number }
  /** Значение — строка 'YYYY-MM-DD'. */
  | { type: 'date'; style?: 'long' | 'full' }
  /** Значение — минуты. */
  | { type: 'duration' }
  /** Значение — мс от эпохи; без timeZone — часовой пояс браузера. */
  | { type: 'datetime'; timeZone?: 'UTC' }
  /** Значение — минуты от полуночи. */
  | { type: 'clock' }
  /** Значение — готовая строка. */
  | { type: 'text' }
  /** Своё форматирование, когда нужны строки перевода (например, «через 2 дня»). */
  | { type: 'custom'; format: (value: any, ctx: { t: T; lang: Lang }) => string };

type InputValue<S> = S extends SelectInput ? S['options'][number] : S extends DateInput ? string : number;
export type Values<I extends Record<string, InputSpec>> = { [K in keyof I]: InputValue<I[K]> };

export interface ToolProps {
  lang: Lang;
  t: T;
}

export interface ExtraProps<V, R> extends ToolProps {
  values: V;
  result: R;
}

export interface CalculatorDef<
  I extends Record<string, InputSpec> = Record<string, InputSpec>,
  R extends object = Record<string, unknown>,
> {
  kind: 'calculator';
  /** Порядок в списках категории и на главной, меньше — выше. Без order — в конце, по алфавиту id. */
  order?: number;
  related?: string[];
  inputs: I;
  /** Чистая функция; бросает исключение, если расчёт невозможен. */
  compute: (values: Values<I>) => R;
  /** Простые значения результата, которые движок выводит сам. Первое — главное. */
  outputs: { [K in keyof R]?: OutputSpec };
  /** Всё, что сложнее чисел: таблицы, графики, схемы. */
  Extra?: ComponentType<ExtraProps<Values<I>, R>>;
}

export interface CustomDef {
  kind: 'custom';
  /** Порядок в списках категории и на главной, меньше — выше. */
  order?: number;
  related?: string[];
  component: ComponentType<ToolProps>;
}

export type ToolDef = CalculatorDef<any, any> | CustomDef;

export const defineCalculator = <const I extends Record<string, InputSpec>, R extends object>(
  def: Omit<CalculatorDef<I, R>, 'kind'>,
): CalculatorDef<I, R> => ({ kind: 'calculator', ...def });

export const defineTool = (def: Omit<CustomDef, 'kind'>): CustomDef => ({ kind: 'custom', ...def });

export interface CategoryDef {
  /** Порядок в навигации, меньше — выше. */
  order: number;
}

export const defineCategory = (def: CategoryDef) => def;
