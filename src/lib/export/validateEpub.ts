export function validateEpubStructure(chapters: any[]): {
    valid: boolean;
    errors: string[];
    warnings: string[];
} {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar capítulos
    if (!chapters || chapters.length === 0) {
        errors.push('No hay capítulos para exportar. Usa títulos (H1) para definir capítulos.');
    }

    chapters.forEach((chapter, index) => {
        if (!chapter.title || chapter.title.trim() === '') {
            warnings.push(`Capítulo ${index + 1} no tiene título definido.`);
        }

        if (!chapter.content || chapter.content.trim() === '') {
            warnings.push(`Capítulo ${index + 1} ("${chapter.title}") está vacío.`);
        }

        // Validar HTML básico y seguridad
        if (chapter.content.includes('<script')) {
            errors.push(`El capítulo ${index + 1} contiene etiquetas <script>, lo cual no está permitido en ePub.`);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
