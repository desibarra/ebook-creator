import { nanoid } from 'nanoid';
import type { Block, BlockType } from '@/features/projects/types';

/**
 * Convierte contenido Markdown a bloques compatibles con el editor
 * Tipos soportados: 'text' | 'heading' | 'divider' | 'spacer' | 'page-break'
 * 
 * NOTA: Las listas se mantienen como 'text' en formato markdown
 */
export function markdownToBlocks(markdown: string): Block[] {
    const lines = markdown.split('\n');
    const blocks: Block[] = [];

    let currentParagraph = '';
    let currentList = '';

    const flushParagraph = () => {
        if (currentParagraph.trim()) {
            blocks.push({
                id: nanoid(),
                type: 'text',
                content: currentParagraph.trim()
            });
            currentParagraph = '';
        }
    };

    const flushList = () => {
        if (currentList.trim()) {
            blocks.push({
                id: nanoid(),
                type: 'text',
                content: currentList.trim() // Lista en formato markdown
            });
            currentList = '';
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Empty line - flush accumulated content
        if (trimmedLine === '') {
            flushParagraph();
            flushList();
            continue;
        }

        // Heading detection (# ## ###)
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            flushParagraph();
            flushList();

            const level = headingMatch[1].length;
            const text = headingMatch[2].trim();

            blocks.push({
                id: nanoid(),
                type: 'heading',
                content: text,
                properties: { level } // Guardar nivel en properties
            });
            continue;
        }

        // Horizontal rule (--- o ***)
        if (/^(---|\*\*\*)$/.test(trimmedLine)) {
            flushParagraph();
            flushList();

            blocks.push({
                id: nanoid(),
                type: 'divider',
                content: ''
            });
            continue;
        }

        // List item detection (- o * o 1.)
        if (/^[-*]\s+/.test(trimmedLine) || /^\d+\.\s+/.test(trimmedLine)) {
            flushParagraph();

            // Acumular líneas de lista consecutivas
            currentList += (currentList ? '\n' : '') + line;
            continue;
        }

        // Regular text (paragraph)
        if (currentList) {
            flushList(); // Si había una lista, cerrarla
        }

        // Acumular párrafo (con espacios entre líneas)
        if (currentParagraph) {
            currentParagraph += '\n' + line;
        } else {
            currentParagraph = line;
        }
    }

    // Flush remaining content
    flushParagraph();
    flushList();

    return blocks;
}

/**
 * Helper: Cuenta palabras en un string
 */
export function countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Helper: Extrae el primer heading del contenido
 */
export function extractFirstHeading(markdown: string): string | null {
    const match = markdown.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
}
