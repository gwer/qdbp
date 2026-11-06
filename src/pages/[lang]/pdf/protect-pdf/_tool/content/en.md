## How to use

Choose a PDF and come up with a password. Click “Protect PDF” and download the file: from now on any program — a browser, Acrobat, a phone viewer — asks for the password before showing the content.

You can also limit what someone who opened the file with the password is allowed to do: print, copy text, edit. Restrictions need a second password, the owner password. It removes the restrictions, so it must differ from the password to open.

Write the password down. It can't be recovered: we never see or store it, and guessing a password for AES-256 encryption is practically impossible.

## How it works

The file's content is encrypted with AES-256, the strongest option the PDF standard (ISO 32000-2) provides. It's supported by Acrobat Reader since version X, by browsers and by modern phone viewers.

Encryption runs in your browser: neither the file nor the password is sent anywhere.

Restrictions on printing and copying, unlike the password to open, are an agreement, not encryption. Acrobat and most programs respect them, but some viewers ignore them. Don't rely on them for truly confidential documents: only the password to open protects the content.

## FAQ

**What password should I choose?** A long one: strength depends on length first of all. A phrase of four or five random words is stronger than a short string of characters. The [password generator](/en/security/password-generator/) can make one for you.

**How do I remove the password later?** Open the file in the [PDF password remover](/en/pdf/unlock-pdf/) and enter the password.

**Are bookmarks and forms kept?** Yes. The whole document is encrypted as it is; nothing is removed.
