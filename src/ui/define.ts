import type { ComponentType } from 'preact';
import type { ClockMode, Lang, UnitSystem } from '@/i18n/config';
import type { T } from '@/i18n/t';
import type { NumberKind } from '@/lib/format';
import type { UnitId } from '@/lib/units';

/** Значения по умолчанию для отдельных языков (ставка НДС страны, привычный формат, правдоподобная сумма). */
type ByLang<V> = { byLang?: Partial<Record<Lang, V>> };

/**
 * Значение по умолчанию, зависящее от выбора в select: { unit: { l100km: 8, mpgus: 28 } }.
 * Важнее byLang. При смене выбора поле получает новое значение, только если в нём стояло прежнее по умолчанию.
 */
type DefaultBy<V> = { defaultBy?: Record<string, Partial<Record<string, V>>> };

/**
 * Поле показывается, только если select'ы имеют указанные значения: { sex: 'female' } или { shape: ['rect', 'square'] }.
 * Скрытое поле не проверяется и не пишется в URL, в расчёт уходит его значение по умолчанию.
 */
type ShowIf = { showIf?: Record<string, string | readonly string[]> };

export type NumberInput = {
  type: 'number' | 'integer' | 'percent';
  default: number;
  min?: number;
  max?: number;
} & ByLang<number> &
  DefaultBy<number>;
export type SelectInput = { type: 'select'; options: readonly string[]; default: string } & ByLang<string>;
/** default: 'YYYY-MM-DD', 'today', 'today±N' или 'next-MM-DD' (ближайшая такая дата). Относительные — только в браузере. */
export type DateInput = { type: 'date'; default: string };
/**
 * Длительность «ч:мм»; default и значение — в минутах.
 * С seconds: true — «ч:мм:сс» или «мм:сс», default и значение в секундах (забеги, темп).
 */
export type DurationInput = { type: 'duration'; default: number; seconds?: boolean };
/** Время на часах; default: 'HH:MM' или 'now' (только в браузере); значение — минуты от полуночи. */
export type TimeInput = { type: 'time'; default: string } & DefaultBy<string>;
/**
 * Величина с единицей измерения. Значение в compute — всегда в unit (метрическая единица инструмента).
 * imperial — единица для американской системы (если не задана, поле не переключается).
 * default — в unit; defaultImperial — «круглое» значение по умолчанию в imperial (иначе конвертируется).
 */
export type QuantityInput = {
  type: 'quantity';
  unit: UnitId;
  imperial?: UnitId;
  default: number;
  defaultImperial?: number;
  min?: number;
  max?: number;
} & ByLang<number>;
/**
 * Поле со своим интерфейсом (например, список досрочных платежей). Значение — каноничная строка,
 * как в URL: её пишет Field, а разбирает compute (бросает InputError, если строка не годится).
 */
export type CustomInput = { type: 'custom'; default: string; Field: ComponentType<CustomFieldProps> } & ByLang<string>;
export interface CustomFieldProps extends ToolProps {
  /** id для подписи; подпись — inputs.{name}.label, её показывает Field. */
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}
export type InputSpec = (NumberInput | SelectInput | DateInput | DurationInput | TimeInput | QuantityInput | CustomInput) & ShowIf;

export type OutputSpec =
  | { type?: NumberKind; digits?: number }
  /** Значение — строка 'YYYY-MM-DD'. */
  | { type: 'date'; style?: 'long' | 'full' }
  /** Значение — минуты (с seconds: true — секунды). */
  | { type: 'duration'; seconds?: boolean }
  /** Значение — мс от эпохи; без timeZone — часовой пояс браузера. */
  | { type: 'datetime'; timeZone?: 'UTC' }
  /** Значение — минуты от полуночи. */
  | { type: 'clock' }
  /** Значение — в unit; показывается в единице выбранной системы с обозначением. */
  | { type: 'quantity'; unit: UnitId; imperial?: UnitId; digits?: number }
  /** Значение — готовая строка. */
  | { type: 'text' }
  /** Своё форматирование, когда нужны строки перевода (например, «через 2 дня»). */
  | { type: 'custom'; format: (value: any, ctx: FormatContext) => string };

/** Всё, от чего зависит показ результата: язык, переводы и настройки пользователя. */
export interface FormatContext {
  t: T;
  lang: Lang;
  units: UnitSystem;
  clock: ClockMode;
}

type InputValue<S> = S extends SelectInput ? S['options'][number] : S extends DateInput | CustomInput ? string : number;
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
  /**
   * Чистая функция; бросает исключение, если расчёт невозможен.
   * InputError('key') — понятная пользователю причина: текст из errors.{key} в i18n инструмента, ключ объявлен в errors.
   */
  compute: (values: Values<I>) => R;
  /** Ключи сообщений, которые compute может бросить через InputError. */
  errors?: readonly string[];
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

/** Расчёт невозможен по понятной причине («цена ниже переменных затрат»); key — из CalculatorDef.errors. */
export class InputError extends Error {
  constructor(readonly key: string) {
    super(key);
  }
}

export const defineCalculator = <const I extends Record<string, InputSpec>, R extends object>(
  def: Omit<CalculatorDef<I, R>, 'kind'>,
): CalculatorDef<I, R> => ({ kind: 'calculator', ...def });

export const defineTool = (def: Omit<CustomDef, 'kind'>): CustomDef => ({ kind: 'custom', ...def });

export interface CategoryDef {
  /** Порядок в навигации, меньше — выше. */
  order: number;
}

export const defineCategory = (def: CategoryDef) => def;
