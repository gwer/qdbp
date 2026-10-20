import type { OutputType } from '@/ui/files/image';

export type Target = 'auto' | 'image/jpeg' | 'image/webp';

/**
 * Формат результата сжатия. «Авто»: JPEG остаётся JPEG, WebP — WebP, а PNG и прочие становятся WebP:
 * canvas кодирует PNG без потерь и почти никогда не делает его меньше оригинала, а WebP сохраняет прозрачность.
 */
export function compressedType(input: string, target: Target): OutputType {
  if (target !== 'auto') return target;
  if (input === 'image/jpeg' || input === 'image/jpg') return 'image/jpeg';
  return 'image/webp';
}

/**
 * Подбор качества под размер файла: двоичный поиск по качеству 0,05–0,95 (7 шагов, точность ≈ 1%).
 * encode — сжатие с заданным качеством. Возвращает самый качественный результат не больше maxBytes,
 * а если не помещается даже минимальное качество — результат с минимальным.
 */
export async function fitToSize(encode: (quality: number) => Promise<Blob>, maxBytes: number): Promise<Blob> {
  let lo = 0.05;
  let hi = 0.95;
  let best = await encode(lo);
  if (best.size > maxBytes) return best;
  for (let i = 0; i < 7; i++) {
    const mid = (lo + hi) / 2;
    const blob = await encode(mid);
    if (blob.size <= maxBytes) {
      best = blob;
      lo = mid;
    } else hi = mid;
  }
  return best;
}
