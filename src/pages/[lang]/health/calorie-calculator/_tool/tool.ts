import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

export const ACTIVITY = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very: 1.9 } as const;
export type Activity = keyof typeof ACTIVITY;

/** Формула Миффлина — Сан Жеора (1990). weight — кг, height — см, age — лет. */
export function bmr(sex: 'male' | 'female', age: number, weight: number, height: number): number {
  return 10 * weight + 6.25 * height - 5 * age + (sex === 'male' ? 5 : -161);
}

export const def = defineCalculator({
  order: 20,
  related: ['bmi'],
  inputs: {
    sex: { type: 'select', options: ['male', 'female'], default: 'male' },
    age: { type: 'integer', default: 30, min: 18, max: 100 },
    weight: { type: 'quantity', unit: 'kg', imperial: 'lb', default: 75, defaultImperial: 170, min: 20, max: 400 },
    height: { type: 'quantity', unit: 'cm', imperial: 'in', default: 178, defaultImperial: 70, min: 100, max: 250 },
    activity: { type: 'select', options: Object.keys(ACTIVITY) as Activity[], default: 'light' },
  },
  compute: ({ sex, age, weight, height, activity }) => {
    const base = bmr(sex, age, weight, height);
    const tdee = base * ACTIVITY[activity];
    return { tdee, bmr: base, loss: tdee * 0.85, gain: tdee * 1.15 };
  },
  outputs: {
    tdee: { type: 'integer' },
    bmr: { type: 'integer' },
    loss: { type: 'integer' },
    gain: { type: 'integer' },
  },
});

export default island(def);
