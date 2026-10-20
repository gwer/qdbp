import { useEffect, useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { QualityField, SelectField } from '@/ui/files/fields';
import { canEncode, decode, encode, LOSSY, outputName, type OutputType } from '@/ui/files/image';
import { ImageBatch, type Processed } from '@/ui/files/ImageBatch';

const BASE: [OutputType, string][] = [
  ['image/jpeg', 'JPG'],
  ['image/png', 'PNG'],
  ['image/webp', 'WebP'],
];

export function ConvertImage({ lang, t }: ToolProps) {
  const [type, setType] = useState<OutputType>('image/jpeg');
  const [quality, setQuality] = useState(90);
  const [background, setBackground] = useState('#ffffff');
  // AVIF показываем, только если браузер действительно умеет его кодировать.
  const [avif, setAvif] = useState(false);
  useEffect(() => void canEncode('image/avif').then(setAvif), []);

  const process = async (file: File): Promise<Processed> => {
    const bitmap = await decode(file);
    try {
      const size = { width: bitmap.width, height: bitmap.height };
      const blob = await encode(bitmap, { ...size, type, quality: quality / 100, background: type === 'image/jpeg' ? background : undefined });
      return { blob, name: outputName(file.name, type), ...size, srcWidth: size.width, srcHeight: size.height };
    } finally {
      bitmap.close();
    }
  };

  return (
    <div>
      <div class="calc-inputs">
        <SelectField id="cv-type" label={t('ui.to')} value={type} options={avif ? [...BASE, ['image/avif', 'AVIF']] : BASE} onChange={setType} />
        {LOSSY.has(type) && <QualityField id="cv-quality" label={t('ui.quality')} value={quality} onChange={setQuality} />}
        {type === 'image/jpeg' && (
          <div class="field">
            <label for="cv-bg">{t('ui.background')}</label>
            <input id="cv-bg" type="color" value={background} onInput={(e) => setBackground(e.currentTarget.value)} />
          </div>
        )}
      </div>
      <ImageBatch t={t} lang={lang} process={process} optionsKey={[type, quality, background].join()} zipName="converted-images.zip" />
    </div>
  );
}
