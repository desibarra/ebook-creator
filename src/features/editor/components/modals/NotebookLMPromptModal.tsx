import React, { useState } from 'react'
import { Copy, ExternalLink, X, Check } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { toast } from 'sonner'
import { Project } from '@/features/projects/types'

interface NotebookLMPromptModalProps {
    isOpen: boolean
    onClose: () => void
    project: Project | null
}

const NotebookLMPromptModal: React.FC<NotebookLMPromptModalProps> = ({ isOpen, onClose, project }) => {
    const [copied, setCopied] = useState(false)

    if (!project) return null

    const content = project.content || {} as any
    const genParams = content.generationParams || {}

    const topic = genParams.topic || project.title || ''
    const audience = genParams.audience || ''
    const purpose = genParams.purpose || ''
    const tone = genParams.tone || ''

    const prompt = `Actúa como un experto investigador especializado en ${topic || '[Main Topic]'}.

OBJETIVO:
Crea una estructura detallada para un libro titulado "${project.title}" dirigido a ${audience || '[Target Audience]'}.

PROPÓSITO:
${purpose || '[Purpose]'}

TONO Y ESTILO:
${tone || '[Tone]'}
` + `
POR FAVOR ANALIZA Y ESTRUCTURA:

1. Introducción al tema
   - Contexto relevante
   - Por qué importa ahora
   - Qué aprenderá el lector

2. Conceptos fundamentales
   - Definiciones clave
   - Datos y estadísticas relevantes
   - Mitos vs realidad

3. Casos de estudio (mínimo 3-4)
   - Nombres ficticios diversos
   - Situaciones reales
   - Lecciones aprendidas

4. Guías prácticas
   - Pasos accionables
   - Checklists
   - Tablas comparativas
   - Recursos y siguientes pasos

ORGANIZA EN 8-10 CAPÍTULOS con:
- Título claro para cada capítulo
- Subtemas principales
- Ejemplos específicos
- Datos que respalden los puntos clave

FORMATO DE SALIDA:
Capítulo 1: [Título]
[Subtema A...]
[Subtema B...]
[Contenido detallado]

Capítulo 2: [Título]
...`

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt)
        setCopied(true)
        toast.success('Prompt copied! Go to NotebookLM, paste it, then come back and use "Generate Full eBook" with the result.')
        setTimeout(() => setCopied(false), 2000)
    }

    const openNotebookLM = () => {
        window.open('https://notebooklm.google.com', '_blank')
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                            <span className="text-3xl">📚</span> NotebookLM Prompt Generator
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-base font-medium">
                        Usa este prompt en NotebookLM para generar el análisis profundo que alimentará tu eBook.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-2 flex-1 overflow-hidden flex flex-col gap-4">

                    <div className="relative flex-1 group">
                        <div className="absolute inset-0 bg-blue-500/5 rounded-xl border-2 border-dashed border-blue-200 pointer-events-none group-hover:border-blue-400 transition-colors" />
                        <Textarea
                            readOnly
                            value={prompt}
                            className="w-full h-[350px] font-mono text-sm p-4 bg-transparent border-none focus-visible:ring-0 resize-none scrollbar-thin overflow-y-auto"
                        />
                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground bg-white/80 px-2 py-1 rounded-md border shadow-sm">
                                {prompt.length} characters
                            </span>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
                        <span className="text-xl">💡</span>
                        <p className="text-xs text-amber-900 leading-relaxed font-medium">
                            <strong>Instrucciones:</strong> Copia este prompt, ve a NotebookLM, pégalo en el chat de tu fuente (o como nueva nota) y cuando obtengas la estructura detallada, regrésala aquí para generar todo el contenido.
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2 bg-muted/30 border-t flex flex-col sm:flex-row gap-2">
                    <Button variant="ghost" onClick={onClose} className="sm:mr-auto font-bold uppercase tracking-wider text-xs">
                        Close
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={openNotebookLM}
                        className="gap-2 font-bold border-2 border-blue-100 hover:bg-blue-50"
                    >
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                        Open NotebookLM
                    </Button>
                    <Button
                        onClick={handleCopy}
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 min-w-[160px]"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4" />
                                Copy to Clipboard
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default NotebookLMPromptModal
