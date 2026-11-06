import type { PDFDocument } from '@cantoo/pdf-lib';
import { loadPdfLib, openPdf, saveBlob } from './pdflib';
import type { PdfSource } from './source';

/** Страница результата: страница index (с 0) из source с дополнительным поворотом. */
export interface PagePart {
  source: PdfSource;
  index: number;
  rotate?: number;
}

/** Документы pdf-lib по источникам: каждый файл разбирается один раз за операцию. */
export function docCache() {
  const docs = new Map<number, Promise<PDFDocument>>();
  return (s: PdfSource) => {
    let d = docs.get(s.id);
    if (!d) docs.set(s.id, (d = openPdf(s.bytes, s.password)));
    return d;
  };
}

/**
 * Новый документ из страниц разных файлов в заданном порядке (объединение, разделение, извлечение).
 * Закладки, формы и ссылки между страницами при копировании не переносятся — так у всех таких инструментов.
 */
export async function assemble(parts: PagePart[], open = docCache()): Promise<Blob> {
  const { PDFDocument, degrees } = await loadPdfLib();
  const out = await PDFDocument.create();
  // Подряд идущие страницы одного файла копируются одним вызовом: общие шрифты и картинки — один раз.
  for (let i = 0; i < parts.length; ) {
    let j = i;
    const indices: number[] = [];
    const seen = new Set<number>();
    while (j < parts.length && parts[j].source === parts[i].source && !seen.has(parts[j].index)) {
      seen.add(parts[j].index);
      indices.push(parts[j].index);
      j++;
    }
    const pages = await out.copyPages(await open(parts[i].source), indices);
    pages.forEach((page, k) => {
      const extra = parts[i + k].rotate ?? 0;
      if (extra) page.setRotation(degrees(normAngle(page.getRotation().angle + extra)));
      out.addPage(page);
    });
    i = j;
  }
  return saveBlob(out);
}

/** Нормализованный угол страницы: 0, 90, 180 или 270. */
export const normAngle = (a: number) => (((Math.round(a / 90) * 90) % 360) + 360) % 360;

/** Страница при правке на месте: index — номер в исходнике (с 0), rotate — дополнительный поворот. */
export interface EditItem {
  index: number;
  rotate: number;
  removed?: boolean;
}

/**
 * Переставляет, поворачивает и удаляет страницы в самом документе, а не в копии:
 * закладки, формы, метаданные и вложения остаются (закладки на удалённые страницы перестают работать).
 */
export async function editPages(source: PdfSource, items: EditItem[]): Promise<Blob> {
  const { degrees, PDFArray, PDFName, PDFNumber } = await loadPdfLib();
  const doc = await openPdf(source.bytes, source.password);
  const pages = doc.getPages();
  const keep = items.filter((it) => !it.removed);
  // Дерево страниц заменяется плоским списком в корне. Атрибуты, которые страница наследовала
  // от промежуточных узлов дерева, сначала переносятся в саму страницу.
  const inherited = ['Resources', 'MediaBox', 'CropBox', 'Rotate'].map((k) => PDFName.of(k));
  const root = doc.catalog.Pages();
  const rootRef = doc.catalog.get(PDFName.of('Pages'))!;
  const kids = PDFArray.withContext(doc.context);
  for (const it of keep) {
    const page = pages[it.index];
    for (const name of inherited) {
      const value = page.node.getInheritableAttribute(name);
      if (value && !page.node.get(name)) page.node.set(name, value);
    }
    if (it.rotate) page.setRotation(degrees(normAngle(page.getRotation().angle + it.rotate)));
    page.node.set(PDFName.of('Parent'), rootRef);
    kids.push(page.ref);
  }
  root.set(PDFName.of('Kids'), kids);
  root.set(PDFName.of('Count'), PDFNumber.of(keep.length));
  return saveBlob(doc);
}
