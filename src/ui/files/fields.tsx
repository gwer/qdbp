import { useState } from 'preact/hooks';

/** Целое число в текстовом поле (как в калькуляторах: без type="number"). Пустое/некорректное не применяется. */
export function IntField({
  id,
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (n: number) => void;
}) {
  const [text, setText] = useState(String(value));
  const parsed = /^\d+$/.test(text.trim()) ? Number(text) : NaN;
  const invalid = !(parsed >= min && parsed <= max);
  return (
    <div class="field">
      <label for={id}>{label}</label>
      <div class="input-wrap">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={text}
          aria-invalid={invalid ? 'true' : undefined}
          style={suffix ? { paddingRight: `${1.4 + 0.6 * suffix.length}em` } : undefined}
          onInput={(e) => {
            const v = e.currentTarget.value;
            setText(v);
            const n = /^\d+$/.test(v.trim()) ? Number(v) : NaN;
            if (n >= min && n <= max) onChange(n);
          }}
        />
        {suffix && <span class="suffix">{suffix}</span>}
      </div>
    </div>
  );
}

/** Качество 1–100 % ползунком. */
export function QualityField({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div class="field">
      <label for={id}>
        {label}: <strong>{value}%</strong>
      </label>
      <input id={id} type="range" min={1} max={100} value={value} onInput={(e) => onChange(Number(e.currentTarget.value))} />
    </div>
  );
}

/** Выпадающий список вариантов с подписями. */
export function SelectField<V extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: V;
  options: [V, string][];
  onChange: (v: V) => void;
}) {
  return (
    <div class="field">
      <label for={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.currentTarget.value as V)}>
        {options.map(([v, text]) => (
          <option value={v} key={v}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}
