import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/utils'
import { useEditorStore } from '@/features/editor/store/useEditorStore'
import { Block } from '@/features/projects/types'
import { Button } from '@/shared/components/ui/button'

import { RegenerateButton } from '@/features/editor/components/RegenerateButton'

interface BlockWrapperProps {
    block: Block
    children: React.ReactNode
}

export function BlockWrapper({ block, children }: BlockWrapperProps) {
    const selectedBlockId = useEditorStore((state) => state.selectedBlockId)
    const selectBlock = useEditorStore((state) => state.selectBlock)
    const deleteBlock = useEditorStore((state) => state.deleteBlock)
    const updateBlock = useEditorStore((state) => state.updateBlock)
    const mode = useEditorStore((state) => state.mode)
    const viewMode = useEditorStore((state) => state.viewMode)
    const isPreview = mode === 'preview'
    const isPrint = viewMode === 'print'

    const [isRegenerating, setIsRegenerating] = useState(false)

    const isSelected = selectedBlockId === block.id

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: block.id,
        disabled: isPreview || isPrint
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const handleRegenerate = async (type: string = 'general') => {
        try {
            setIsRegenerating(true)
            const response = await fetch('/api/ai/regenerate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    block: block,
                    improvementType: type,
                    projectId: 'current'
                })
            })

            const data = await response.json()
            if (data.error) throw new Error(data.error)

            updateBlock(block.id, { content: data.content })
            toast.success("Block regenerated!")
        } catch (error) {
            console.error(error)
            toast.error("Failed to regenerate block")
        } finally {
            setIsRegenerating(false)
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative my-2 rounded-xl border-2 border-transparent transition-all duration-200",
                !isPreview && isSelected ? "border-blue-500 bg-blue-50/30 dark:bg-blue-900/10 shadow-sm" : !isPreview && "hover:border-slate-200 dark:hover:border-slate-800",
                isRegenerating && "opacity-70 pointer-events-none"
            )}
            onClick={(e) => {
                if (isPreview) return
                e.stopPropagation()
                selectBlock(block.id)
            }}
        >
            {!isPreview && (
                <div
                    className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full px-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab",
                        isSelected && "opacity-100"
                    )}
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
            )}

            {/* Content */}
            <div className="p-4 min-h-[50px] relative">
                {children}

                {/* ✅ Indicador de inserción cuando está seleccionado */}
                {isSelected && !isPreview && (
                    <div className="absolute -bottom-2.5 left-0 right-0 h-1 flex items-center justify-center z-30 pointer-events-none">
                        <div className="w-full h-[2px] bg-blue-500/50 rounded-full mx-8 animate-pulse" />
                        <div className="absolute bg-blue-600 text-[10px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-bounce shadow-lg">
                            ↓ Nuevo bloque aquí
                        </div>
                    </div>
                )}

                {isRegenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-sm z-10">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                )}
            </div>

            {/* Actions */}
            {isSelected && !isRegenerating && !isPreview && (
                <div
                    className="absolute right-2 top-2 flex gap-1 bg-background/95 backdrop-blur-sm rounded-md shadow-md border p-1 opacity-0 group-hover:opacity-100 transition-all z-50"
                    contentEditable={false}
                >
                    <RegenerateButton
                        isRegenerating={isRegenerating}
                        onRegenerate={handleRegenerate}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 pointer-events-auto"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            deleteBlock(block.id)
                        }}
                        title="Delete block"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}
