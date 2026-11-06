import { openPdf } from '@/ui/pdf/pdflib';

export interface Restrictions {
  print: boolean;
  copy: boolean;
  edit: boolean;
}

/**
 * Шифрует PDF (AES-256). Пароль открытия обязателен. Ограничения действуют для того, кто открыл файл
 * паролем открытия; снимает их пароль владельца. Без ограничений пароль владельца совпадает с паролем открытия.
 */
export async function protect(bytes: Uint8Array, sourcePassword: string | undefined, password: string, owner: string, r: Restrictions): Promise<Uint8Array> {
  const doc = await openPdf(bytes, sourcePassword);
  const restricted = r.print || r.copy || r.edit;
  doc.encrypt({
    userPassword: password,
    ownerPassword: restricted ? owner : password,
    permissions: {
      printing: r.print ? false : 'highResolution',
      copying: !r.copy,
      contentAccessibility: true,
      modifying: !r.edit,
      annotating: !r.edit,
      fillingForms: !r.edit,
      documentAssembly: !r.edit,
    },
  });
  return doc.save();
}
