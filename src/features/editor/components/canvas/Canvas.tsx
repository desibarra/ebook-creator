
'use client'

import { useState, useEffect } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { useEditorStore } from '@/features/editor/store/useEditorStore'
import { BlockRenderer } from '../blocks/BlockRenderer'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog'
import { Textarea } from '@/shared/components/ui/textarea'
import { PrintLayoutView } from '../PrintLayoutView'

export function Canvas() {
    const blocks = useEditorStore((state) => state.blocks)
    const reorderBlocks = useEditorStore((state) => state.reorderBlocks)
    const selectBlock = useEditorStore((state) => state.selectBlock)
    const viewMode = useEditorStore((state) => state.viewMode)

    const [activeChapter, setActiveChapter] = useState<string>('')
    const [currentPage, setCurrentPage] = useState<number>(1)

    // Track active chapter via IntersectionObserver
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.target.tagName === 'H1') {
                        setActiveChapter(entry.target.textContent || '')
                    }
                })
            },
            { threshold: 0.1, rootMargin: '-56px 0px -80% 0px' }
        )

        // Observe all h1 elements in the canvas
        const headings = document.querySelectorAll('#ebook-canvas h1')
        headings.forEach((h) => observer.observe(h))

        return () => observer.disconnect()
    }, [blocks]) // Re-run when blocks change to catch new headings

    // Simple page estimation based on scroll position in Normal View
    useEffect(() => {
        if (viewMode === 'print') return

        const handleScroll = (e: Event) => {
            const target = e.target as HTMLElement
            if (!target) return

            const scrollTop = target.scrollTop
            const pageHeight = 1056 // Approximate A4 height in pixels
            const newPage = Math.max(1, Math.ceil((scrollTop + 400) / pageHeight))
            setCurrentPage(newPage)
        }

        const scrollContainer = document.querySelector('.editor-scroll-container')
        scrollContainer?.addEventListener('scroll', handleScroll)
        return () => scrollContainer?.removeEventListener('scroll', handleScroll)
    }, [viewMode])

    // Local state for generation modal
    const [showGenerateModal, setShowGenerateModal] = useState(false)
    const [generateTopic, setGenerateTopic] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (active.id !== over?.id) {
            const oldIndex = blocks.findIndex((block) => block.id === active.id)
            const newIndex = blocks.findIndex((block) => block.id === over?.id)
            reorderBlocks(oldIndex, newIndex)
        }
    }

    const handleBackgroundClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            selectBlock(null)
        }
    }

    const handleGenerateSection = async () => {
        if (!generateTopic.trim()) return

        try {
            setIsGenerating(true)
            const response = await fetch('/api/ai/generate-section', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: generateTopic })
            })

            const data = await response.json()
            if (data.error) throw new Error(data.error)

            useEditorStore.getState().addBlocks(data.blocks)

            setShowGenerateModal(false)
            setGenerateTopic('')
            toast.success('Section generated successfully')

        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to generate section')
        } finally {
            setIsGenerating(false)
        }
    }

    const isPrintView = viewMode === 'print'

    return (
        <>
            <div
                className={cn(
                    "flex-1 overflow-auto bg-muted/20 min-h-full transition-colors editor-scroll-container pb-20",
                    !isPrintView && "p-8 cursor-text"
                )}
                onClick={handleBackgroundClick}
            >
                {/* Sticky Header Indicator */}
                <div className="sticky top-0 z-[60] bg-white/95 backdrop-blur-sm border-b px-6 py-2.5 flex items-center shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex-1 flex items-center gap-2">
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">LEYENDO</span>
                        <span className="text-sm font-semibold text-gray-700 truncate max-w-[300px]">
                            {activeChapter || 'Inicio del Documento'}
                        </span>
                    </div>

                    <div className="flex-1 text-center">
                        <div className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PÁGINA</span>
                            <span className="text-sm font-bold text-blue-600">
                                {viewMode === 'print' ? 'MODO DINÁMICO' : currentPage}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 flex justify-end">
                        {!isPrintView && (
                            <span className="text-[10px] text-gray-400 font-medium">Modo Edición Normal</span>
                        )}
                    </div>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    {isPrintView ? (
                        <PrintLayoutView blocks={blocks} />
                    ) : (
                        <div id="ebook-canvas" className="mx-auto max-w-[816px] min-h-[1056px] bg-background shadow-sm border rounded-sm p-[96px] relative flex flex-col">
                            <SortableContext
                                items={blocks.map(b => b.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-4">
                                    {blocks.map((block) => (
                                        <BlockRenderer
                                            key={block.id}
                                            block={block}
                                        />
                                    ))}
                                </div>
                            </SortableContext>

                            {/* Add Section Button */}
                            <div className="mt-8 py-8 border-t border-dashed flex justify-center">
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowGenerateModal(true)
                                    }}
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Generate new section with AI
                                </Button>
                            </div>
                        </div>
                    )}
                </DndContext>
            </div>

            <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Generate New Section with AI</DialogTitle>
                        <DialogDescription>
                            Describe el contenido que deseas generar. Pega información de NotebookLM y añade instrucciones.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Textarea
                                className="min-h-[200px] font-mono text-sm"
                                placeholder={`Ejemplo:
|
Capítulo 1: Introducción - La Confusión Común

INFORMACIÓN CIENTÍFICA:
- 30% de mujeres >60 años tienen hipotiroidismo
- Síntomas se solapan con menopausia

DESARROLLO:
Escribe 800 palabras explicando por qué se confunden ambas condiciones. Incluye caso de Laura, 52 años. Tono empático.`}
                                value={generateTopic}
                                onChange={(e) => setGenerateTopic(e.target.value)}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{generateTopic.length} caracteres {generateTopic.length < 20 && '(mínimo 20)'}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowGenerateModal(false)}>Cancel</Button>
                        <Button
                            onClick={handleGenerateSection}
                            disabled={isGenerating || generateTopic.length < 20}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            ✨ Generate Content
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
