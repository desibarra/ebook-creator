
import OpenAI from 'openai'
import { Block, BlockType } from '@/features/projects/types'
import { nanoid } from 'nanoid'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
    dangerouslyAllowBrowser: true // Only if you are running this client-side, but this service is server-side compatible
})

interface GenerateEbookParams {
    topic: string
    audience: string
    purpose: string
    tone: string
    title: string
}

const SYSTEM_PROMPT = `
You are an expert eBook ghostwriter and structural editor. 
Your task is to generate a comprehensive, structured eBook outline and initial content based on the user's request.
Output format must be a strictly valid JSON array of blocks, where each block has:
- type: "heading" | "text" | "divider" | "page-break"
- content: string (the actual text)
- level: number (only for headings, 1-3)

Rules:
1. Start with a simplified Title Page (Heading 1).
2. Create a "Table of Contents" placeholder.
3. Generate 3-5 key chapters.
4. Each chapter should have a Heading 2, followed by 1-2 paragraphs of introductory text.
5. Use the specified tone.
6. Target the specified audience.
7. Focus on the specified purpose/goal.
8. RETURN ONLY THE JSON ARRAY. NO MARKDOWN FORMATTING OR BACKTICKS.

Example Output Structure:
[
  { "type": "heading", "content": "The Title", "level": 1 },
  { "type": "text", "content": "A brief introduction..." },
  { "type": "page-break", "content": "" },
  { "type": "heading", "content": "Chapter 1: Getting Started", "level": 2 },
  { "type": "text", "content": "In this chapter, we will discuss..." }
]
`

interface AIBlockResponse {
    type: string
    content: string
    level?: number
}

export const aiService = {
    async generateEbookContent(params: GenerateEbookParams): Promise<Block[]> {
        // If no API key is set, return mock data to avoid crashing
        if (!process.env.OPENAI_API_KEY) {
            console.warn('No OPENAI_API_KEY found, returning mock content.')
            return getMockContent(params)
        }

        try {
            const completion = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    {
                        role: 'user',
                        content: `
              Title: ${params.title}
              Topic: ${params.topic}
              Audience: ${params.audience}
              Purpose: ${params.purpose}
              Tone: ${params.tone}
              
              Generate the eBook structure now.
            `,
                    },
                ],
                temperature: 0.7,
            })

            const content = completion.choices[0]?.message?.content || '[]'

            // Attempt to clean markdown code blocks if present
            const cleanContent = content.replace(/^```json\s*/, '').replace(/\s*```$/, '')

            let parsedContent: AIBlockResponse[] = []
            try {
                parsedContent = JSON.parse(cleanContent)
            } catch {
                console.error('Failed to parse AI response:', content)
                throw new Error('Invalid JSON response from AI')
            }

            // Map to our Block format
            return parsedContent.map((item: AIBlockResponse) => ({
                id: nanoid(),
                type: item.type as BlockType,
                content: item.content,
                properties: item.level ? { level: item.level } : {},
            }))

        } catch (error) {
            console.error('Error generating AI content:', error)
            // Fallback to mock content on error
            return getMockContent(params)
        }
    },

    async regenerateBlock(block: Block, instructions?: string): Promise<string> {
        if (!process.env.OPENAI_API_KEY) {
            return "MOCK REGENERATED CONTENT: " + block.content
        }

        const prompt = `
        You are an expert editor. Rewrite the following content.
        Original Content: "${block.content}"
        Type: ${block.type}
        Instructions: ${instructions || 'Improve clarity and flow.'}
        
        Return ONLY the rewritten text string. No quotes, no markdown.
      `

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        })

        return completion.choices[0]?.message?.content || block.content
    },

    async generateSection(topic: string): Promise<Block[]> {
        if (!process.env.OPENAI_API_KEY) {
            return [
                { id: nanoid(), type: 'heading', content: `Section: ${topic}`, properties: { level: 2 } },
                { id: nanoid(), type: 'text', content: `Mock content for ${topic}` }
            ]
        }

        const prompt = `
        You are an eBook writer. Generate a new section about "${topic}".
        Output strictly a JSON array of blocks (heading, text). 
        No markdown.
      `

        try {
            const completion = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
            })

            const content = completion.choices[0]?.message?.content || '[]'
            const cleanContent = content.replace(/^```json\s*/, '').replace(/\s*```$/, '')
            const parsedContent: AIBlockResponse[] = JSON.parse(cleanContent)

            return parsedContent.map((item: AIBlockResponse) => ({
                id: nanoid(),
                type: item.type as BlockType,
                content: item.content,
                properties: item.level ? { level: item.level } : {},
            }))
        } catch (error) {
            console.error('Error generating section:', error)
            return [
                { id: nanoid(), type: 'text', content: 'Error generating section. Please try again.' }
            ]
        }
    }
}

function getMockContent(params: GenerateEbookParams): Block[] {
    return [
        {
            id: nanoid(),
            type: 'heading',
            content: params.title,
            properties: { level: 1, align: 'center' }
        },
        {
            id: nanoid(),
            type: 'text',
            content: `A comprehensive guide on ${params.topic} for ${params.audience}.`,
        },
        {
            id: nanoid(),
            type: 'divider',
            content: ''
        },
        {
            id: nanoid(),
            type: 'heading',
            content: 'Introduction',
            properties: { level: 2 }
        },
        {
            id: nanoid(),
            type: 'text',
            content: `Welcome to this eBook about ${params.topic}. Our goal is to ${params.purpose}. This content is designed specifically for ${params.audience}, maintaining a ${params.tone} tone throughout.`,
        },
        {
            id: nanoid(),
            type: 'heading',
            content: 'Chapter 1: The Basics (Mock Data)',
            properties: { level: 2 }
        },
        {
            id: nanoid(),
            type: 'text',
            content: 'This is a placeholder chapter generated because the AI service is not yet fully configured or encountered an error. In a production environment with a valid API key, this would be rich, generated content.',
        },
        {
            id: nanoid(),
            type: 'image',
            content: '', // Placeholder for an image URL
            properties: {
                alt: 'Placeholder Image',
                caption: 'Visual representation of the topic'
            }
        }
    ]
}
