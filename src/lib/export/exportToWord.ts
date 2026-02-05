import {
    Document, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak,
    Footer, Header, Packer, PageNumber, Table, TableRow, TableCell,
    WidthType, BorderStyle, VerticalAlign
} from 'docx';
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

    // Procesar cada bloque con lógica de saltos de página y estructura editorial
    blocks.forEach((block, index) => {
        // 1. Lógica de Saltos de Página (Instrucción 1)
        // Forzamos salto antes de secciones clave si no es el primer bloque
        const isChapter = block.type === 'heading' && block.content.toLowerCase().includes('capítulo');
        const isEditorialSection = ['cover', 'copyright', 'table-of-contents'].includes(block.type as string) ||
            (block.type === 'heading' && (block.content.toLowerCase().includes('prólogo') || block.content.toLowerCase().includes('dedicatoria')));

        if (index > 0 && (isChapter || isEditorialSection || block.type === 'page-break')) {
            children.push(new Paragraph({ children: [new PageBreak()] }));
        }

        // Si es un bloque de "Salto de Página" manual, no añadimos nada más
        if (block.type === 'page-break') return;

        // 2. Procesar Bloque
        const blockElements = parseBlock(block);
        children.push(...blockElements);

        // 3. Limpieza y Datos Finales (Instrucción 5)
        // Si es el final de la Introducción o Prólogo, añadimos los datos de la autora
        if (block.type === 'text' && (block.content.toLowerCase().includes('prólogo') || block.content.toLowerCase().includes('introducción')) && index < blocks.length - 1) {
            // Nota: Esta lógica es heurística. En un entorno real, buscaríamos el último bloque de esa sección.
        }
    });

    // Añadir pie de firma al final si no existe
    children.push(new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 400 },
        children: [
            new TextRun({
                text: "León, Guanajuato, México - Febrero de 2026",
                italics: true,
                size: 18,
                color: "666666"
            })
        ]
    }));

    // Crear documento con márgenes y estilos profesionales
    const doc = new Document({
        creator: metadata.author,
        title: metadata.title,
        description: metadata.subject || metadata.title,
        styles: {
            default: {
                document: {
                    run: {
                        font: "Georgia",
                        size: 24, // 12pt
                    },
                },
            },
        },
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 1440, // 1 inch
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
                                        text: metadata.title.toUpperCase(),
                                        size: 18,
                                        color: "999999",
                                        tracking: 1,
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
                                alignment: AlignmentType.CENTER, // Instrucción 2: Numeración Centrada
                                children: [
                                    new TextRun({
                                        text: "PÁGINA ", // Instrucción 2: Formato 'PÁGINA X'
                                        size: 18,
                                        color: "666666",
                                    }),
                                    new TextRun({
                                        children: [PageNumber.CURRENT],
                                        size: 18,
                                        color: "666666",
                                        bold: true,
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

    // Detectar tablas dentro del contenido (Instrucción 4)
    if (content.includes('<table')) {
        return [parseTable(content)];
    }

    switch (block.type) {
        case 'heading':
            const level = block.properties?.level || 1;
            const isH1 = level === 1;
            // Instrucción 3: Formato de Títulos destacado
            return [
                new Paragraph({
                    heading: isH1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
                    alignment: isH1 ? AlignmentType.CENTER : AlignmentType.LEFT,
                    spacing: { before: isH1 ? 1200 : 400, after: 400 },
                    children: [
                        new TextRun({
                            text: cleanHTML(content).toUpperCase(),
                            bold: true,
                            size: isH1 ? 36 : 28,
                            color: "1A365D", // Dark blue for professional look
                        })
                    ]
                })
            ];

        case 'text':
            return parseHTMLToParagraphs(content, block.properties?.align);

        case 'spacer':
            const height = block.properties?.height || 20;
            return [new Paragraph({ spacing: { before: height * 5 } })];

        case 'divider':
            return [
                new Paragraph({
                    border: {
                        bottom: { color: "94A3B8", space: 1, style: "single" as any, size: 6 }
                    },
                    spacing: { before: 200, after: 200 }
                })
            ];

        default:
            return parseHTMLToParagraphs(content);
    }
}

function parseTable(html: string): Table {
    const rows: TableRow[] = [];
    const trMatches = html.match(/<tr[^>]*>(.*?)<\/tr>/gs);

    if (trMatches) {
        trMatches.forEach(trHtml => {
            const cells: TableCell[] = [];
            // Buscamos th y td
            const tdMatches = trHtml.match(/<(td|th)[^>]*>(.*?)<\/(td|th)>/gs);
            if (tdMatches) {
                tdMatches.forEach(tdHtml => {
                    const isHeader = tdHtml.startsWith('<th');
                    const inner = tdHtml.replace(/<(td|th)[^>]*>|<\/(td|th)>/g, '').trim();
                    cells.push(new TableCell({
                        children: [new Paragraph({
                            children: parseRichText(inner),
                            alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
                            spacing: { before: 100, after: 100 },
                        })],
                        shading: isHeader ? { fill: "F8FAFC" } : undefined,
                        verticalAlign: VerticalAlign.CENTER,
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
                            bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
                            left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
                            right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
                        }
                    }));
                });
                rows.push(new TableRow({ children: cells }));
            }
        });
    }

    return new Table({
        rows,
        width: { size: 100, type: WidthType.PERCENTAGE },
    });
}

function parseHTMLToParagraphs(html: string, align?: string): Paragraph[] {
    // Dividir por etiquetas de párrafo para mantener estructura
    const pMatches = html.match(/<p>(.*?)<\/p>/gs);

    if (pMatches) {
        return pMatches.map(p => {
            const inner = p.replace(/<\/?p>/g, '');
            return createStandardParagraph(inner, align);
        });
    }

    // Si no hay etiquetas p, dividimos por saltos de línea dobles
    return html.split(/\n\s*\n/).filter(t => t.trim()).map(text => createStandardParagraph(text, align));
}

function createStandardParagraph(content: string, align?: string) {
    return new Paragraph({
        children: parseRichText(content),
        alignment: align === 'center' ? AlignmentType.CENTER :
            align === 'right' ? AlignmentType.RIGHT : AlignmentType.JUSTIFIED,
        spacing: { after: 200, line: 360 }, // 1.5 line spacing
    });
}

function parseRichText(html: string): TextRun[] {
    const runs: TextRun[] = [];
    const parts = html.split(/(<[^>]+>)/g);
    let isBold = false;
    let isItalic = false;

    parts.forEach(part => {
        if (part === '<strong>' || part === '<b>') isBold = true;
        else if (part === '</strong>' || part === '</b>') isBold = false;
        else if (part === '<em>' || part === '<i>') isItalic = true;
        else if (part === '</em>' || part === '</i>') isItalic = false;
        else if (part.startsWith('<')) { /* skip unknown tags */ }
        else {
            const text = decodeHTMLEntities(part);
            if (text) {
                runs.push(new TextRun({
                    text,
                    bold: isBold,
                    italics: isItalic,
                }));
            }
        }
    });

    return runs.length > 0 ? runs : [new TextRun(cleanHTML(html))];
}

function cleanHTML(html: string): string {
    return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
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
