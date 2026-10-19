export interface TextStats {
  chars: number;
  charsNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
}

const hasSegmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl;

function countSegments(text: string, locale: string, granularity: 'grapheme' | 'word' | 'sentence'): number {
  let n = 0;
  for (const seg of new Intl.Segmenter(locale, { granularity }).segment(text)) {
    if (granularity === 'word' ? seg.isWordLike : granularity === 'sentence' ? seg.segment.trim() : true) n++;
  }
  return n;
}

export function countText(text: string, locale: string): TextStats {
  const noSpaces = text.replace(/\s/g, '');
  if (!hasSegmenter) {
    return {
      chars: Array.from(text).length,
      charsNoSpaces: Array.from(noSpaces).length,
      words: text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0,
      sentences: text.split(/[.!?…]+/).filter((s) => s.trim()).length,
      paragraphs: text.split(/\n/).filter((s) => s.trim()).length,
    };
  }
  return {
    // Графемы, а не code units: эмодзи и буквы с диакритикой считаются как один символ.
    chars: countSegments(text, locale, 'grapheme'),
    charsNoSpaces: countSegments(noSpaces, locale, 'grapheme'),
    words: countSegments(text, locale, 'word'),
    sentences: countSegments(text, locale, 'sentence'),
    paragraphs: text.split(/\n/).filter((s) => s.trim()).length,
  };
}
