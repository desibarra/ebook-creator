import { Block } from '@/features/projects/types';

interface Chapter {
    title: string;
    content: string;
}

export function blocksToChapters(blocks: Block[]): Chapter[] {
    const chapters: Chapter[] = [];
    let currentChapter: Chapter | null = null;

    blocks.forEach((block) => {
        // Detectar inicio de capítulo (Heading H1 o que contenga la palabra Capítulo)
        const isChapterHeading =
            block.type === 'heading' &&
            (block.properties?.level === 1 ||
                block.content.toLowerCase().includes('capítulo') ||
                block.content.toLowerCase().includes('chapter'));

        if (isChapterHeading) {
            // Guardar capítulo anterior si existe
            if (currentChapter) {
                chapters.push(currentChapter);
            }

            // Iniciar nuevo capítulo
            currentChapter = {
                title: cleanText(block.content),
                content: '',
            };
        } else if (currentChapter) {
            // Agregar contenido al capítulo actual
            currentChapter.content += formatBlockForEpub(block);
        } else if (!currentChapter && block.type !== 'page-break' && block.type !== 'spacer') {
            // Si hay contenido antes del primer Capítulo (como un Prólogo), crear capítulo genérico
            currentChapter = {
                title: 'Introducción',
                content: formatBlockForEpub(block),
            };
        }
    });

    // Agregar último capítulo si quedó pendiente
    if (currentChapter) {
        chapters.push(currentChapter);
    }

    // Si aún no hay capítulos (documento vacío), devolver algo mínimo
    if (chapters.length === 0) {
        chapters.push({ title: 'Contenido', content: '<p>Sin contenido.</p>' });
    }

    return chapters;
}

function formatBlockForEpub(block: Block): string {
    switch (block.type) {
        case 'heading':
            const level = block.properties?.level || 2;
            return `<h${level}>${cleanText(block.content)}</h${level}>\n`;

        case 'text':
            // Si el contenido ya tiene <p>, lo usamos. Si no, lo envolvemos.
            return block.content.includes('<p>') ? block.content : `<p>${block.content}</p>\n`;

        case 'image':
            // Las imágenes en ePub suelen requerir manejo especial de archivos, por ahora solo el tag
            return `<div style="text-align:center"><img src="${block.content}" alt="imagen" style="max-width:100%"/></div>\n`;

        case 'divider':
            return '<hr/>\n';

        case 'spacer':
            return '<br/>\n';

        default:
            return `<div>${block.content}</div>\n`;
    }
}

function cleanText(text: string): string {
    // Eliminar etiquetas HTML para títulos o metadatos
    return text.replace(/<[^>]*>?/gm, '').trim();
}
