import {
    Document, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak,
    Footer, Header, Packer, PageNumber, Table, TableRow, TableCell,
    WidthType, BorderStyle, VerticalAlign
} from 'docx';
import { saveAs } from 'file-saver';
import { Block } from '@/features/projects/types';

/**
 * Universal eBook Word Exporter (.docx)
 * Implements professional editorial standards applicable to any book.
 */
export async function exportToWord(
    blocks: Block[],
    metadata: {
        title: string;
        author: string;
        subject?: string;
    }
) {
    const children: any[] = [];

    // Process each block with universal layout criteria
    blocks.forEach((block, index) => {
        const type = block.type as string;

        // 1. Universal Page Breaks
        // Books standardly start new pages at:
        // - Major Headings (Level 1)
        // - Structural sections (Cover, Copyright, TOC)
        // - Explicit Page Break blocks
        const isHeading1 = block.type === 'heading' && block.properties?.level === 1;
        const isStructuralSection = ['cover', 'copyright', 'table-of-contents'].includes(type);
        const isManualBreak = type === 'page-break';

        if (index > 0 && (isHeading1 || isStructuralSection || isManualBreak)) {
            children.push(new Paragraph({ children: [new PageBreak()] }));
        }

        // If it's a manual beak, it already served its purpose
        if (isManualBreak) return;

        // 2. Process block content
        const blockElements = parseBlock(block);
        children.push(...blockElements);
    });

    // Create the document with a universal style system
    const doc = new Document({
        creator: metadata.author || "eBook Creator",
        title: metadata.title,
        description: metadata.subject || metadata.title,
        styles: {
            default: {
                document: {
                    run: {
                        font: "Georgia", // Classic editorial font
                        size: 24, // 12pt
                    },
                    paragraph: {
                        alignment: AlignmentType.JUSTIFIED, // Universal justified body text
                        spacing: { line: 360, after: 200 }, // 1.5 line spacing for readability
                    }
                },
            },
        },
        sections: [
            {
                properties: {
                    page: {
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1-inch standard margins
                    },
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER, // Universal centered page numbering
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
    const filename = `${metadata.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
    saveAs(blob, filename);
}

function parseBlock(block: Block): any[] {
    let content = block.content || "";

    // HTML cleaning to prevent words from sticking together when removing tags
    // Add spaces between blocks that are often intended to be separate
    content = content.replace(/<\/p><p>/g, '</p><p> </p><p>');
    content = content.replace(/<\/span><span>/g, ' </span><span>');
    content = content.replace(/&nbsp;/g, ' ');

    // Handle HTML tables
    if (content.includes('<table')) {
        return [createProfessionalTable(content)];
    }

    switch (block.type) {
        case 'heading':
            const level = block.properties?.level || 1;
            return [
                new Paragraph({
                    heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
                    alignment: level === 1 ? AlignmentType.CENTER : AlignmentType.LEFT,
                    spacing: { before: level === 1 ? 800 : 400, after: 400 },
                    children: [
                        new TextRun({
                            text: cleanTextOnly(content).toUpperCase(),
                            bold: true,
                            size: level === 1 ? 36 : 28,
                            color: "000000",
                        })
                    ]
                })
            ];

        case 'spacer':
            return [new Paragraph({ spacing: { before: (block.properties?.height || 20) * 5 } })];

        case 'divider':
            return [
                new Paragraph({
                    border: {
                        bottom: { color: "E2E8F0", space: 1, style: BorderStyle.SINGLE, size: 6 }
                    },
                    spacing: { before: 200, after: 200 }
                })
            ];

        default:
            return parseHTMLToParagraphs(content, block.properties?.align);
    }
}

function createProfessionalTable(html: string): Table {
    const rows: TableRow[] = [];
    const trMatches = html.match(/<tr[^>]*>(.*?)<\/tr>/gsi);

    trMatches?.forEach(trHtml => {
        const cells: TableCell[] = [];
        const tdMatches = trHtml.match(/<(td|th)[^>]*>(.*?)<\/(td|th)>/gsi);

        tdMatches?.forEach(tdHtml => {
            const isHeader = tdHtml.toLowerCase().includes('<th');
            const text = cleanTextOnly(tdHtml);
            cells.push(new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ text, bold: isHeader, size: 20 })],
                    alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
                    spacing: { before: 100, after: 100 },
                })],
                shading: isHeader ? { fill: "F8FAFC" } : undefined,
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
                    left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
                    right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
                },
                verticalAlign: VerticalAlign.CENTER,
            }));
        });

        if (cells.length > 0) rows.push(new TableRow({ children: cells }));
    });

    return new Table({
        rows: rows.length > 0 ? rows : [new TableRow({ children: [new TableCell({ children: [new Paragraph("Empty Table")] })] })],
        width: { size: 100, type: WidthType.PERCENTAGE },
    });
}

function parseHTMLToParagraphs(html: string, manualAlign?: string): Paragraph[] {
    const blocks = html.split(/<\/p>|<br\s*\/?>/i).filter(b => b.trim().length > 0);

    return blocks.map(block => {
        return new Paragraph({
            children: parseRichText(block),
            alignment: manualAlign === 'center' ? AlignmentType.CENTER :
                manualAlign === 'right' ? AlignmentType.RIGHT : AlignmentType.JUSTIFIED,
        });
    });
}

function parseRichText(html: string): TextRun[] {
    const runs: TextRun[] = [];
    const parts = html.split(/(<[^>]+>)/g);
    let isBold = false;
    let isItalic = false;

    parts.forEach(part => {
        const pLower = part.toLowerCase();
        if (pLower.includes('strong') || pLower.includes('<b>')) isBold = !part.includes('/');
        else if (pLower.includes('em') || pLower.includes('<i>')) isItalic = !part.includes('/');
        else if (part.startsWith('<')) { /* ignore other tags */ }
        else {
            const clean = decodeHTMLEntities(part);
            if (clean) runs.push(new TextRun({ text: clean, bold: isBold, italics: isItalic }));
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
