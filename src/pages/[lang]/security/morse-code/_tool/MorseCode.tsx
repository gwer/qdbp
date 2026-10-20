import type { ToolProps } from '@/ui/define';
import { TextConverter, type Mode } from '@/ui/TextConverter';
import { decodeMorse, encodeMorse } from './morse';

export function MorseCode({ lang, t }: ToolProps) {
  const modes: Mode[] = [
    { id: 'encode', run: encodeMorse, inverse: 'decode' },
    { id: 'decode', run: (s) => decodeMorse(s, 'latin'), inverse: 'encode' },
  ];
  // Кириллическая азбука нужна только русскоязычным; коды частично совпадают с латиницей.
  if (lang === 'ru') modes.push({ id: 'decodeCyrillic', run: (s) => decodeMorse(s, 'cyrillic'), inverse: 'encode' });
  return <TextConverter t={t} modes={modes} />;
}
