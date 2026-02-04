import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SYSTEM_PROMPTS } from '@/lib/prompts/ebook-generator-prompts';
import { createClient } from '@/shared/lib/supabase/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const IMPROVEMENT_PROMPTS = {
    general: 'Mejora la redacción general, claridad y fluidez del contenido manteniendo la misma estructura.',
    add_example: 'Añade 1-2 ejemplos prácticos concretos que ilustren mejor los conceptos principales.',
    simplify: 'Simplifica el lenguaje para hacerlo más accesible sin perder profundidad técnica.',
    expand: 'Expande el contenido con más detalles, explicaciones adicionales y contexto relevante.'
};

export async function POST(req: NextRequest) {
    try {
        const { chapterTitle, currentContent, improvementType, ebookContext } = await req.json();

        // Auth check
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!chapterTitle || !currentContent) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: chapterTitle and currentContent'
            }, { status: 400 });
        }

        const improvementInstruction = IMPROVEMENT_PROMPTS[improvementType as keyof typeof IMPROVEMENT_PROMPTS]
            || IMPROVEMENT_PROMPTS.general;

        const prompt = `
Eres un editor profesional mejorando un capítulo de eBook.

**CONTEXTO DEL EBOOK:**
- Título: ${ebookContext?.title || 'Sin especificar'}
- Categoría: ${ebookContext?.category || 'General'}
- Público: ${ebookContext?.targetAudience || 'General'}

**CAPÍTULO ACTUAL:**
# ${chapterTitle}

${currentContent}

**INSTRUCCIÓN DE MEJORA:**
${improvementInstruction}

**REGLAS ESTRICTAS:**
1. Mantén la longitud similar (±150 palabras respecto al original)
2. NO inventes datos, estadísticas o fuentes que no estén en el contenido original
3. Mantén el mismo tono y enfoque general
4. Preserva TODOS los números, porcentajes y citas de fuentes [Fuente: X]
5. Mejora SOLO según la instrucción dada
6. Mantén el formato markdown (# ## ** - etc.)

**FORMATO DE SALIDA:**
Markdown puro del capítulo mejorado. NO incluyas metadatos, títulos adicionales ni explicaciones.
Solo el contenido del capítulo.
    `.trim();

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPTS.regeneration
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2500
        });

        const improvedContent = completion.choices[0].message.content || currentContent;

        return NextResponse.json({
            success: true,
            content: improvedContent,
            wordCount: improvedContent.split(/\s+/).length
        });

    } catch (error: unknown) {
        console.error('❌ Regenerate Chapter Error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Failed to regenerate chapter';
        return NextResponse.json({
            success: false,
            error: errorMessage
        }, { status: 500 });
    }
}
