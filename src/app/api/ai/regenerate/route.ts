import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { SYSTEM_PROMPTS } from '@/lib/prompts/ebook-generator-prompts'
import { createClient } from '@/shared/lib/supabase/server'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
    try {
        const {
            block, // block object
            improvementType = 'general',
            context = { ebookTitle: 'Untitled' },
            currentContent, // fallback if block is not passed fully or we just want to pass content
            instructions // Optional extra instructions
        } = await request.json()

        // Auth check (optional but recommended)
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const contentToImprove = currentContent || block?.content || ''

        const prompt = `${SYSTEM_PROMPTS.regeneration}

CONTEXTO DEL EBOOK: ${context.ebookTitle}

CONTENIDO ACTUAL A MEJORAR:
"${contentToImprove}"

TIPO DE MEJORA SOLICITADA: ${improvementType}
${improvementType === 'add_example' ? '- Añade un ejemplo concreto o caso práctico' : ''}
${improvementType === 'simplify' ? '- Simplifica el lenguaje técnico' : ''}
${improvementType === 'expand' ? '- Expande con más detalles y contexto' : ''}
${improvementType === 'general' ? '- Mejora redacción, claridad y fluidez' : ''}
${instructions ? `INSTRUCCIONES ADICIONALES: ${instructions}` : ''}

INSTRUCCIONES:
- Mantén la longitud similar (±100 palabras) salvo si se pide expandir
- Preserva datos factuales, técnicos o científicos exactos
- Mejora según el tipo solicitado
- Formato markdown
`

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8, // Creative for improvement
            max_tokens: 2000
        })

        const newContent = completion.choices[0].message.content

        return NextResponse.json({
            success: true,
            content: newContent, // Keeping 'content' key for compatibility with existing frontend
            newContent: newContent,
            tokensUsed: completion.usage?.total_tokens
        })

    } catch (error: unknown) {
        console.error('❌ Error en regeneración:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json({
            success: false,
            error: errorMessage
        }, { status: 500 })
    }
}
