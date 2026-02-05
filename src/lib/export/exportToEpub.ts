import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface EpubOptions {
    title: string;
    author: string;
    publisher?: string;
    description?: string;
    cover?: string;
    isbn?: string;
    language?: string;
    published?: string;
    genre?: string;
    copyright?: string;
}

interface Chapter {
    title: string;
    content: string;
}

export async function exportToEpub(
    chapters: Chapter[],
    options: EpubOptions
) {
    const zip = new JSZip();

    // 1. mimetype (debe ser el primero y sin compresión)
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    // 2. META-INF/container.xml
    zip.folder('META-INF')?.file('container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

    // 3. Carpeta de archivos de contenido
    const oebps = zip.folder('OEBPS');
    if (!oebps) throw new Error("Could not create OEBPS folder");

    // 4. content.opf
    oebps.file('content.opf', generateContentOpf(chapters, options));

    // 5. toc.ncx (Navegación clásica eReaders antiguos)
    oebps.file('toc.ncx', generateTocNcx(chapters, options));

    // 6. toc.xhtml (Navegación moderna EPUB 3)
    oebps.file('toc.xhtml', generateTocXhtml(chapters));

    // 7. Styles
    oebps.folder('css')?.file('styles.css', generateStylesCss());

    // 8. Capítulos
    chapters.forEach((chapter, index) => {
        oebps.file(`chapter${index + 1}.xhtml`, generateChapterXhtml(chapter, index + 1));
    });

    // 9. Generar y descargar
    const content = await zip.generateAsync({
        type: 'blob',
        mimeType: 'application/epub+zip',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
    });

    const filename = `${options.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.epub`;
    saveAs(content, filename);
}

function generateContentOpf(chapters: Chapter[], options: EpubOptions): string {
    const uuid = `urn:uuid:${Math.random().toString(36).substring(2, 15)}`;
    const now = new Date().toISOString().replace(/\.[0-9]+Z/, 'Z');

    let manifest = `
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="styles" href="css/styles.css" media-type="text/css"/>
  `;

    let spine = `<itemref idref="toc"/>\n`;

    chapters.forEach((_, index) => {
        const id = `chapter${index + 1}`;
        manifest += `    <item id="${id}" href="${id}.xhtml" media-type="application/xhtml+xml"/>\n`;
        spine += `    <itemref idref="${id}"/>\n`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="pub-id">${uuid}</dc:identifier>
    <dc:title>${escapeXml(options.title)}</dc:title>
    <dc:creator>${escapeXml(options.author)}</dc:creator>
    <dc:language>${options.language || 'es'}</dc:language>
    <dc:date>${options.published || now}</dc:date>
    ${options.publisher ? `<dc:publisher>${escapeXml(options.publisher)}</dc:publisher>` : ''}
    ${options.description ? `<dc:description>${escapeXml(options.description)}</dc:description>` : ''}
    <meta property="dcterms:modified">${now}</meta>
  </metadata>
  <manifest>
    ${manifest}
  </manifest>
  <spine toc="ncx">
    ${spine}
  </spine>
</package>`;
}

function generateTocNcx(chapters: Chapter[], options: EpubOptions): string {
    let navPoints = '';
    chapters.forEach((chapter, index) => {
        navPoints += `
    <navPoint id="navpoint-${index + 1}" playOrder="${index + 1}">
      <navLabel><text>${escapeXml(chapter.title)}</text></navLabel>
      <content src="chapter${index + 1}.xhtml"/>
    </navPoint>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="random-id"/>
    <meta name="dtb:depth" content="1"/>
  </head>
  <docTitle><text>${escapeXml(options.title)}</text></docTitle>
  <navMap>
    ${navPoints}
  </navMap>
</ncx>`;
}

function generateTocXhtml(chapters: Chapter[]): string {
    let items = '';
    chapters.forEach((chapter, index) => {
        items += `<li><a href="chapter${index + 1}.xhtml">${escapeXml(chapter.title)}</a></li>\n`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Contenido</title>
  <link rel="stylesheet" type="text/css" href="css/styles.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Contenido</h1>
    <ol>
      ${items}
    </ol>
  </nav>
</body>
</html>`;
}

function generateChapterXhtml(chapter: Chapter, index: number): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${escapeXml(chapter.title)}</title>
  <link rel="stylesheet" type="text/css" href="css/styles.css"/>
</head>
<body>
  <section class="chapter">
    <h1 class="chapter-title">${escapeXml(chapter.title)}</h1>
    ${chapter.content}
  </section>
</body>
</html>`;
}

function generateStylesCss(): string {
    return `
body { font-family: Georgia, serif; line-height: 1.5; margin: 5%; text-align: justify; }
h1, h2, h3 { text-align: center; color: #333; }
.chapter-title { margin-bottom: 2em; }
p { margin-bottom: 1em; }
table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
th { background-color: #f9f9f9; }
hr { border: 0; border-top: 1px solid #ccc; margin: 2em 0; }
`;
}

function escapeXml(text: string): string {
    return text.replace(/[<>&"']/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&apos;';
            default: return c;
        }
    });
}
