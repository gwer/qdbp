// Чистка документа перед сохранением: недостижимые объекты и страницы, которых в результате нет.
import type { PDFDocument, PDFObject, PDFRef } from '@cantoo/pdf-lib';
import type { loadPdfLib } from './pdflib';

type Lib = Awaited<ReturnType<typeof loadPdfLib>>;

/** Объекты, достижимые от корня документа (/Root, /Info). */
export function reachable(lib: Lib, doc: PDFDocument): Set<PDFRef> {
  const { PDFDict, PDFArray, PDFRef } = lib;
  const seen = new Set<PDFRef>();
  const ctx = doc.context;
  const stack: PDFObject[] = [ctx.trailerInfo.Root, ctx.trailerInfo.Info].filter(Boolean) as PDFObject[];
  while (stack.length) {
    const o = stack.pop()!;
    if (o instanceof PDFRef) {
      if (seen.has(o)) continue;
      seen.add(o);
      const target = ctx.lookup(o);
      if (target) stack.push(target);
    } else if (o instanceof PDFDict) {
      for (const [, v] of o.entries()) stack.push(v);
    } else if (o instanceof PDFArray) {
      for (const v of o.asArray()) stack.push(v);
    } else if ((o as { dict?: unknown }).dict instanceof PDFDict) {
      stack.push((o as unknown as { dict: PDFObject }).dict);
    }
  }
  return seen;
}

/** Удаляет недостижимые объекты (мусор прошлых правок, отрезанные страницы). Возвращает их число. */
export function dropUnreachable(lib: Lib, doc: PDFDocument): number {
  const keep = reachable(lib, doc);
  let n = 0;
  for (const [ref] of doc.context.enumerateIndirectObjects()) {
    if (!keep.has(ref)) {
      doc.context.delete(ref);
      n++;
    }
  }
  return n;
}

/**
 * Оставляет в файле только страницы keep. На страницы, которых в результате нет, могут ссылаться
 * ссылки внутри документа, закладки, поля форм (/Dest, /P) — и тащить за собой их текст и картинки:
 * удалённая страница оставалась бы в файле невидимой. Такие ссылки обнуляются, затем мусор удаляется.
 */
export function keepOnlyPages(lib: Lib, doc: PDFDocument, keep: Set<PDFRef>): void {
  const { PDFDict, PDFArray, PDFRef, PDFName, PDFNull } = lib;
  const ctx = doc.context;
  const pageType = PDFName.of('Page');
  const gone = new Set<PDFRef>();
  for (const [ref, obj] of ctx.enumerateIndirectObjects()) {
    if (obj instanceof PDFDict && obj.get(PDFName.of('Type')) === pageType && !keep.has(ref)) gone.add(ref);
  }
  if (!gone.size) return;
  const visit = (o: PDFObject | undefined) => {
    if (o instanceof PDFDict) {
      for (const [k, v] of o.entries()) {
        if (v instanceof PDFRef && gone.has(v)) o.set(k, PDFNull);
        else visit(v);
      }
    } else if (o instanceof PDFArray) {
      for (let i = 0; i < o.size(); i++) {
        const v = o.get(i);
        if (v instanceof PDFRef && gone.has(v)) o.set(i, PDFNull);
        else visit(v);
      }
    } else if (o && (o as { dict?: unknown }).dict instanceof PDFDict) {
      visit((o as unknown as { dict: PDFObject }).dict);
    }
  };
  for (const [ref, obj] of ctx.enumerateIndirectObjects()) if (!gone.has(ref)) visit(obj);
  dropUnreachable(lib, doc);
}
