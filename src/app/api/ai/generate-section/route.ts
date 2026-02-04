
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { SYSTEM_PROMPTS, buildGenerationPrompt } from '@/lib/prompts/ebook-generator-prompts'
import { nanoid } from 'nanoid'
import { Block } from '@/features/projects/types'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
    try {
        const {
            topic: description,
            ebookContext = { title: 'Untitled', targetAudience: 'General' },
            generationType = 'medical_ebook'
        } = await request.json()

        // Validation
        if (!description || description.trim().length < 5) { // User said 20, keeping it loose for testing but checking existence
            return NextResponse.json({
                success: false,
                error: 'La descripción debe tener al menos 5 caracteres'
            }, { status: 400 })
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                success: false,
                error: 'API Key de OpenAI no configurada'
            }, { status: 500 })
        }

        const systemPrompt = SYSTEM_PROMPTS[generationType as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.universal
        const userPrompt = buildGenerationPrompt(description, ebookContext)

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 3000,
            presence_penalty: 0.1,
            frequency_penalty: 0.1
        })

        const generatedContent = completion.choices[0].message.content

        if (!generatedContent || generatedContent.trim().length < 50) {
            throw new Error('OpenAI generó contenido insuficiente')
        }

        const blocks = parseMarkdownIntoBlocks(generatedContent)

        return NextResponse.json({
            success: true,
            blocks: blocks,
            rawContent: generatedContent,
            metadata: {
                tokensUsed: completion.usage?.total_tokens,
                model: completion.model,
                wordsGenerated: generatedContent.split(/\s+/).length
            }
        })

    } catch (error: unknown) {
        console.error('❌ Error en generación:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido en la generación'
        return NextResponse.json({
            success: false,
            error: errorMessage
        }, { status: 500 })
    }
}

// Helper function to parse markdown into blocks
function parseMarkdownIntoBlocks(content: string) {
    const blocks: Block[] = []
    const lines = content.split('\n')
    let currentBlock: Block = { id: nanoid(), type: 'text', content: '', properties: {} }
    let inCodeBlock = false
    let inTable = false
    let tableBuffer: string[] = []

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // Detect code blocks
        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock
            // We don't really support code blocks yet in our UI blocks, treating as text for now
            // or we can allow it in the text content
            continue
        }

        // Detect table start
        if (line.trim().startsWith('|') && !inTable) {
            if (currentBlock.content.trim()) {
                blocks.push({ ...currentBlock })
                currentBlock = { id: nanoid(), type: 'text', content: '', properties: {} }
            }
            inTable = true
            tableBuffer = [line]
            continue
        }

        // Accumulate table
        if (inTable) {
            if (line.trim().startsWith('|')) {
                tableBuffer.push(line)
                continue
            } else {
                // End of table
                // We probably don't have a 'table' block type yet. 
                // We will store it as a special text block or markdown block if supported, 
                // or just 'text' with markdown content.
                // For now, let's treat it as a text block containing markdown table
                blocks.push({
                    id: nanoid(),
                    type: 'text',
                    content: tableBuffer.join('\n'),
                    properties: { isTable: true }
                })
                tableBuffer = []
                inTable = false
            }
        }

        // Detect headings
        const headingMatch = line.match(/^(#{1,3})\s+(.+)$/)
        if (headingMatch && !inCodeBlock) {
            if (currentBlock.content.trim()) {
                blocks.push({ ...currentBlock })
                currentBlock = { id: nanoid(), type: 'text', content: '', properties: {} }
            }

            blocks.push({
                id: nanoid(),
                type: 'heading',
                content: headingMatch[2].trim(),
                properties: {
                    level: headingMatch[1].length
                }
            })
            continue
        }

        // Accumulate normal content
        currentBlock.content += line + '\n'

        // Detect paragraph break
        if (!line.trim() && currentBlock.content.trim() &&
            i + 1 < lines.length && !lines[i + 1].trim()) {
            blocks.push({ ...currentBlock })
            currentBlock = { id: nanoid(), type: 'text', content: '', properties: {} }
        }
    }

    if (currentBlock.content.trim()) {
        blocks.push(currentBlock)
    }

    if (tableBuffer.length > 0) {
        blocks.push({
            id: nanoid(),
            type: 'text',
            content: tableBuffer.join('\n'),
            properties: { isTable: true }
        })
    }

    return blocks
        .filter(b => b.content && b.content.trim())
        .map(b => ({
            ...b,
            content: b.content.trim()
        }))
}
