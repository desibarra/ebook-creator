import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, Footer, Header, Packer, PageNumber } from 'docx';
import { saveAs } from 'file-saver';
import { Block } from '@/features/projects/types';

export async function exportToWord(
    blocks: Block[],
    metadata: {
        title: string;
        author: string;
        subject?: string;
    }
) {
    const children: any[] = [];

    // Procesar cada bloque
    blocks.forEach((block) => {
        const blockContent = parseBlock(block);
        children.push(...blockContent);
    });

    // Crear documento
    const doc = new Document({
        creator: metadata.author,
        title: metadata.title,
        description: metadata.subject || metadata.title,
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 1440, // 1 inch = 1440 twips
                            right: 1440,
                            bottom: 1440,
                            left: 1440,
                        },
                    },
                },
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: metadata.title,
                                        size: 20,
                                        color: "999999",
                                    })
                                ],
                                alignment: AlignmentType.CENTER,
                                spacing: { after: 200 },
                            }),
                        ],
                    }),
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: "Página ",
                                        size: 18,
                                    }),
                                    new TextRun({
                                        children: [PageNumber.CURRENT],
                                        size: 18,
                                    }),
                                ],
                            }),
                        ],
                    }),
                },
                children,
            },
        ],
    });

    // Generar y descargar
    const blob = await Packer.toBlob(doc);
    const filename = `${metadata.title.replace(/[^a-z0-9]/gi, '_')}.docx`;
    saveAs(blob, filename);
}

function parseBlock(block: Block): any[] {
    const content = block.content;

    switch (block.type) {
        case 'heading':
            const level = block.properties?.level || 1;
            return [
                new Paragraph({
                    text: cleanHTML(content),
                    heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
                    spacing: { before: 400, after: 200 },
                    alignment: block.properties?.align === 'center' ? AlignmentType.CENTER :
                        block.properties?.align === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT,
                })
            ];

        case 'text':
            return parseHTMLToParagraphs(content, block.properties?.align);

        case 'page-break':
            return [new Paragraph({ children: [new PageBreak()] })];

        case 'spacer':
            const height = block.properties?.height || 20;
            return [new Paragraph({ spacing: { before: height * 5 } })]; // Simple approx conversion

        case 'divider':
            return [
                new Paragraph({
                    border: {
                        bottom: { color: "E2E8F0", space: 1, style: "single" as any, size: 6 }
                    },
                    spacing: { before: 200, after: 200 }
                })
            ];

        default:
            return parseHTMLToParagraphs(content);
    }
}

function parseHTMLToParagraphs(html: string, align?: string): Paragraph[] {
    // Dividir por etiquetas de párrafo si existen
    const pMatches = html.match(/<p>(.*?)<\/p>/gs);

    if (pMatches) {
        return pMatches.map(p => {
            const inner = p.replace(/<\/?p>/g, '');
            return new Paragraph({
                children: parseRichText(inner),
                alignment: align === 'center' ? AlignmentType.CENTER :
                    align === 'right' ? AlignmentType.RIGHT : AlignmentType.JUSTIFIED,
                spacing: { after: 200 },
            });
        });
    }

    // Fallback: tratar como texto plano con decoraciones
    return [
        new Paragraph({
            children: parseRichText(html),
            alignment: align === 'center' ? AlignmentType.CENTER :
                align === 'right' ? AlignmentType.RIGHT : AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
        })
    ];
}

function parseRichText(html: string): TextRun[] {
    const runs: TextRun[] = [];

    // Un parser muy simplificado que maneja solo bold, italic y underline secuenciales
    // Para algo mejor necesitaríamos una librería de parsing HTML o usar el DOM en cliente
    let currentText = html;

    // Por simplicidad para MVP, limpiaremos y aplicaremos estilos básicos
    // Si hay un <strong> lo haremos bold, etc.
    // Una forma sencilla es buscar etiquetas y dividir

    const parts = currentText.split(/(<[^>]+>)/g);
    let isBold = false;
    let isItalic = false;
    let isUnderline = false;

    parts.forEach(part => {
        if (part === '<strong>' || part === '<b>') isBold = true;
        else if (part === '</strong>' || part === '</b>') isBold = false;
        else if (part === '<em>' || part === '<i>') isItalic = true;
        else if (part === '</em>' || part === '</i>') isItalic = false;
        else if (part === '<u>') isUnderline = true;
        else if (part === '</u>') isUnderline = false;
        else if (part.startsWith('<')) { /* ignorar otros tags */ }
        else if (part.trim() !== '' || part === ' ') {
            runs.push(new TextRun({
                text: decodeHTMLEntities(part),
                bold: isBold,
                italics: isItalic,
                underline: isUnderline ? {} : undefined,
            }));
        }
    });

    if (runs.length === 0 && html.trim() !== '') {
        runs.push(new TextRun({ text: cleanHTML(html) }));
    }

    return runs;
}

function cleanHTML(html: string): string {
    return html.replace(/<[^>]+>/g, '').trim();
}

function decodeHTMLEntities(text: string): string {
    return text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
}
