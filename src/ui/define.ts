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
export type InputSpec = NumberInput | SelectInput;

export type OutputSpec = { type?: NumberKind; digits?: number };

type InputValue<S> = S extends SelectInput ? S['options'][number] : number;
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
