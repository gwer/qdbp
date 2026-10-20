import { useRef, useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { QualityField, SelectField } from '@/ui/files/fields';
import { encode, LOSSY, outputName, type OutputType } from '@/ui/files/image';
import { FileError, ImageBatch, type Processed } from '@/ui/files/ImageBatch';
import { decodeHeic, HeicError, loadDecoder } from './decoder';

const TYPES: [OutputType, string][] = [
  ['image/jpeg', 'JPG'],
  ['image/png', 'PNG'],
  ['image/webp', 'WebP'],
];

// Явный список, а не image/*: с image/* iPhone при выборе из галереи сам перекодирует фото в JPEG.
const ACCEPT = '.heic,.heif,image/heic,image/heif,image/heic-sequence,image/heif-sequence';

type Decoder = 'idle' | 'loading' | 'ready' | 'failed';

export function HeicToJpg({ lang, t }: ToolProps) {
  const [type, setType] = useState<OutputType>('image/jpeg');
  const [quality, setQuality] = useState(90);
  const [decoder, setDecoder] = useState<Decoder>('idle');
  // Последний запуск по каждому файлу: при смене настроек старые задачи из очереди пропускаются.
  const latest = useRef(new WeakMap<File, number>());
  const seq = useRef(0);

  const process = async (file: File): Promise<Processed> => {
    const token = ++seq.current;
    latest.current.set(file, token);
    if (decoder !== 'ready') {
      setDecoder('loading');
      loadDecoder().then(
        () => setDecoder('ready'),
        () => setDecoder('failed'),
      );
    }
    let image: ImageData;
    try {
      image = await decodeHeic(file, () => latest.current.get(file) !== token);
    } catch (e) {
      const code = e instanceof HeicError ? e.code : 'broken';
      throw new FileError(t(`ui.errors.${code === 'skipped' ? 'broken' : code}`));
    }
    const bitmap = await createImageBitmap(image);
    try {
      const size = { width: bitmap.width, height: bitmap.height };
      const blob = await encode(bitmap, { ...size, type, quality: quality / 100 });
      return { blob, name: outputName(file.name, type), ...size, srcWidth: size.width, srcHeight: size.height };
    } finally {
      bitmap.close();
    }
  };

  return (
    <div>
      <div class="calc-inputs">
        <SelectField id="heic-type" label={t('ui.to')} value={type} options={TYPES} onChange={setType} />
        {LOSSY.has(type) && <QualityField id="heic-quality" label={t('ui.quality')} value={quality} onChange={setQuality} />}
      </div>
      {decoder === 'loading' && (
        <p class="muted" role="status">
          {t('ui.loading')}
        </p>
      )}
      {decoder === 'failed' && (
        <p class="field-error" role="alert">
          {t('ui.loadFailed')}
        </p>
      )}
      <ImageBatch t={t} lang={lang} process={process} optionsKey={[type, quality].join()} zipName="heic-to-jpg.zip" accept={ACCEPT} />
    </div>
  );
}
