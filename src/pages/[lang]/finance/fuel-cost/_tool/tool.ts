import { convert } from '@/lib/units';
import { defineCalculator } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

export type Economy = 'l100km' | 'kml' | 'mpgus' | 'mpguk';

const UK_GALLON = 4.54609;

/** Литры на поездку. distance — км. */
export function fuelLiters(distance: number, economy: number, unit: Economy): number {
  if (!(economy > 0)) throw new RangeError('fuel economy must be positive');
  const miles = convert(distance, 'km', 'mi');
  switch (unit) {
    case 'l100km':
      return (distance * economy) / 100;
    case 'kml':
      return distance / economy;
    case 'mpgus':
      return convert(miles / economy, 'gal', 'l');
    case 'mpguk':
      return (miles / economy) * UK_GALLON;
  }
}

/** Цена — за литр, а для mpg US — за галлон США: так топливо продают там, где эта единица в ходу. */
export function fuelCost(distance: number, economy: number, unit: Economy, price: number, people: number, roundTrip = false) {
  if (!Number.isInteger(people) || people < 1) throw new RangeError('people must be a positive integer');
  const fuel = fuelLiters(roundTrip ? distance * 2 : distance, economy, unit);
  const cost = (unit === 'mpgus' ? convert(fuel, 'l', 'gal') : fuel) * price;
  return { cost, perPerson: cost / people, fuel };
}

// Единицы расхода и цены — как принято в стране языка: в США mpg и $ за галлон, в Бразилии км/л.
export const def = defineCalculator({
  order: 150,
  related: ['electricity-cost', 'fuel-consumption', 'auto-loan'],
  inputs: {
    distance: { type: 'quantity', unit: 'km', imperial: 'mi', default: 500, defaultImperial: 300, min: 0 },
    trip: { type: 'select', options: ['oneWay', 'round'], default: 'oneWay' },
    unit: { type: 'select', options: ['l100km', 'kml', 'mpgus', 'mpguk'], default: 'l100km', byLang: { en: 'mpgus', pt: 'kml' } },
    economy: { type: 'number', default: 8, min: 0, defaultBy: { unit: { l100km: 8, kml: 12, mpgus: 28, mpguk: 40 } } },
    price: { type: 'number', default: 1.7, min: 0, byLang: { ru: 62, en: 3.5, es: 1.55, de: 1.75, pt: 6.2 } },
    people: { type: 'integer', default: 2, min: 1, max: 100 },
  },
  compute: ({ distance, trip, unit, economy, price, people }) => fuelCost(distance, economy, unit, price, people, trip === 'round'),
  outputs: {
    cost: { type: 'money' },
    perPerson: { type: 'money' },
    fuel: { type: 'quantity', unit: 'l', imperial: 'gal', digits: 1 },
  },
});

export default island(def);
