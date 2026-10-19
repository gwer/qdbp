/** distance — км, time — секунды. */
export function pace(distance: number, time: number) {
  return { pace: time / distance, speed: distance / (time / 3600) };
}

/** Прогноз времени на другой дистанции по формуле Ригеля: T₂ = T₁ × (D₂ / D₁)^1,06. */
export const riegel = (time: number, from: number, to: number) => time * (to / from) ** 1.06;
