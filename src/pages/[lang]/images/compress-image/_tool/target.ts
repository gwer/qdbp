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
