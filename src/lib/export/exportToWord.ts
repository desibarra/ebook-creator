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

    // Procesar cada bloque con lógica estricta de maquetación editorial
    blocks.forEach((block, index) => {
        const contentUpper = block.content?.toUpperCase() || "";
        const type = block.type as string;

        // 1. Saltos de Página Obligatorios (Instrucción 1 del usuario)
        const isChapter = block.type === 'heading' && contentUpper.includes('CAPÍTULO');
        const isTOC = type === 'table-of-contents' || contentUpper.includes('CONTENIDO');
        const isDedication = contentUpper.includes('DEDICATORIA');
        const isPrologue = contentUpper.includes('PRÓLOGO') || contentUpper.includes('INTRODUCCIÓN');
        const isCopyright = type === 'copyright' || contentUpper.includes('COPYRIGHT');

        // Insertar salto de página antes de estas secciones (excepto si es el primer bloque)
        if (index > 0 && (isChapter || isTOC || isDedication || isPrologue || isCopyright || type === 'page-break')) {
            children.push(new Paragraph({ children: [new PageBreak()] }));
        }

        if (type === 'page-break') return;

        // 2. Procesar el bloque (con detección de tablas mejorada)
        const blockElements = parseBlock(block);
        children.push(...blockElements);
    });

    // 3. Firma final (Instrucción 5 del usuario)
    children.push(new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 800 },
        children: [
            new TextRun({
                text: "León, Guanajuato, México - Febrero de 2026",
                italics: true,
                size: 20,
                color: "555555"
            })
        ]
    }));

    // Crear documento final
    const doc = new Document({
        creator: metadata.author,
        title: metadata.title,
        styles: {
            default: {
                document: {
                    run: {
                        font: "Georgia",
                        size: 24, // 12pt
                    },
                    paragraph: {
                        alignment: AlignmentType.JUSTIFIED, // Cuerpo Justificado por defecto (Alineación)
                        spacing: { line: 360, after: 200 }, // Interlineado 1.5
                    }
                },
            },
        },
        sections: [
            {
                properties: {
                    page: {
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
                    },
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER, // Numeración Centrada (Instrucción 2)
                                children: [
                                    new TextRun({
                                        text: "PÁGINA ",
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

    const blob = await Packer.toBlob(doc);
    const filename = `${metadata.title.replace(/[^a-z0-9]/gi, '_')}.docx`;
    saveAs(blob, filename);
}

function parseBlock(block: Block): any[] {
    let content = block.content || "";

    // 4. Corrección de Espaciado: Evitar que palabras se peguen (Instrucción 4)
    // Reemplazamos tags que suelen pegar palabras por el mismo tag con un espacio
    content = content.replace(/<\/p><p>/g, '</p><p> </p><p>');
    content = content.replace(/<\/span><span>/g, ' </span><span>');
    content = content.replace(/<\/strong><span>/g, ' </strong><span>');
    content = content.replace(/&nbsp;/g, ' ');

    // 5. Reconstrucción de Tablas (Instrucción 3 y 4)
    // Si el bloque parece una tabla o contiene la lista de síntomas que el usuario quiere convertir
    if (content.includes('<table') || (content.toUpperCase().includes('SÍNTOMA') && content.toUpperCase().includes('HIPOTIROIDISMO'))) {
        return [createProfessionalTable(content)];
    }

    switch (block.type) {
        case 'heading':
            const level = block.properties?.level || 1;
            return [
                new Paragraph({
                    heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
                    alignment: AlignmentType.CENTER, // Títulos Centrados (Instrucción 5)
                    spacing: { before: level === 1 ? 800 : 400, after: 400 },
                    children: [
                        new TextRun({
                            text: cleanTextOnly(content).toUpperCase(),
                            bold: true, // En Negritas
                            size: level === 1 ? 36 : 28,
                            color: "000000",
                        })
                    ]
                })
            ];

        case 'text':
        case 'copyright':
        case 'table-of-contents':
            return parseHTMLToParagraphs(content, block.properties?.align);

        case 'spacer':
            return [new Paragraph({ spacing: { before: (block.properties?.height || 20) * 5 } })];

        default:
            return parseHTMLToParagraphs(content);
    }
}

function createProfessionalTable(html: string): Table {
    const rows: TableRow[] = [];

    // Si el contenido NO es una tabla real pero tiene los datos de síntomas
    if (!html.includes('<tr')) {
        // Limpiamos y dividimos por líneas
        const rawText = cleanTextOnly(html.replace(/<br\s*\/?>|<\/p>/gi, '\n'));
        const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 5);

        // Header obligatorio (Instrucción 3)
        rows.push(new TableRow({
            children: [
                createCell("SÍNTOMA", true),
                createCell("HIPOTIROIDISMO / MENOPAUSIA", true),
                createCell("OBSERVACIONES", true),
            ]
        }));

        // Intentar separar síntomas por ":" o "-"
        lines.forEach(line => {
            if (line.includes(':') || line.includes('-')) {
                const separator = line.includes(':') ? ':' : '-';
                const parts = line.split(separator);
                const symp = parts[0].trim();
                const obs = parts.slice(1).join(separator).trim();
                rows.push(new TableRow({
                    children: [createCell(symp), createCell(obs), createCell("-")]
                }));
            }
        });
    } else {
        // Parsear tabla HTML real (mejorado con multiline)
        const trMatches = html.match(/<tr[^>]*>(.*?)<\/tr>/gsi);
        trMatches?.forEach(trHtml => {
            const cells: TableCell[] = [];
            const tdMatches = trHtml.match(/<(td|th)[^>]*>(.*?)<\/(td|th)>/gsi);
            tdMatches?.forEach(tdHtml => {
                const isHeader = tdHtml.toLowerCase().includes('<th');
                const text = cleanTextOnly(tdHtml);
                cells.push(createCell(text, isHeader));
            });
            if (cells.length > 0) rows.push(new TableRow({ children: cells }));
        });
    }

    return new Table({
        rows: rows.length > 0 ? rows : [new TableRow({ children: [createCell("Formato de tabla no detectado")] })],
        width: { size: 100, type: WidthType.PERCENTAGE },
    });
}

function createCell(text: string, isHeader = false): TableCell {
    return new TableCell({
        children: [new Paragraph({
            children: [new TextRun({ text, bold: isHeader, size: 22 })],
            alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: { before: 120, after: 120 },
        })],
        shading: isHeader ? { fill: "F2F2F2" } : undefined,
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
        },
        verticalAlign: VerticalAlign.CENTER,
    });
}

function parseHTMLToParagraphs(html: string, manualAlign?: string): Paragraph[] {
    // Dividimos por bloques de párrafo y saltos br para evitar palabras pegadas
    const blocks = html.split(/<\/p>|<br\s*\/?>/i).filter(b => b.trim().length > 0);

    return blocks.map(block => {
        return new Paragraph({
            children: parseRichText(block),
            alignment: manualAlign === 'center' ? AlignmentType.CENTER : AlignmentType.JUSTIFIED, // Justificado y Centrado
        });
    });
}

function parseRichText(html: string): TextRun[] {
    const runs: TextRun[] = [];
    // Un split que no borre los espacios entre etiquetas
    const parts = html.split(/(<[^>]+>)/g);
    let isBold = false;
    let isItalic = false;

    parts.forEach(part => {
        const pLower = part.toLowerCase();
        if (pLower.includes('strong') || pLower.includes('<b>')) isBold = !part.includes('/');
        else if (pLower.includes('em') || pLower.includes('<i>')) isItalic = !part.includes('/');
        else if (part.startsWith('<')) {
            // Si es un tag y el siguiente parte es texto, añadimos un espacio si es un tag bloque
            if (pLower.includes('span') || pLower.includes('div')) {
                // No hacemos nada, solo evitamos pegar
            }
        }
        else {
            const clean = decodeHTMLEntities(part);
            if (clean && clean !== ' ') {
                runs.push(new TextRun({ text: clean, bold: isBold, italics: isItalic }));
            } else if (clean === ' ') {
                runs.push(new TextRun({ text: ' ' }));
            }
        }
    });

    return runs.length > 0 ? runs : [new TextRun({ text: cleanTextOnly(html) })];
}

function cleanTextOnly(html: string): string {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeHTMLEntities(text: string): string {
    return text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}
