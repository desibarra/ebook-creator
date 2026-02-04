
'use client'

import { Block } from '@/features/projects/types'
import { useEditorStore } from '@/features/editor/store/useEditorStore'
import { FileText } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface CopyrightPageBlockProps {
    block: Block
}

export function CopyrightPageBlock({ block }: CopyrightPageBlockProps) {
    const updateBlock = useEditorStore((state) => state.updateBlock)
    const isSelected = useEditorStore((state) => state.selectedBlockId === block.id)
    const mode = useEditorStore((state) => state.mode)
    const isPreview = mode === 'preview'

    const year = block.properties?.year || new Date().getFullYear()
    const author = block.properties?.author || ''
    const isbn = block.properties?.isbn || ''

    const containerClasses = cn(
        "copyright-page-block relative transition-all duration-200 p-8",
        !isPreview && isSelected && "ring-2 ring-primary ring-offset-4 rounded-lg",
        isPreview && "border-none shadow-none"
    )

    if (isPreview || !isSelected) {
        return (
            <div className={containerClasses}>
                <div className="absolute -left-12 top-8 text-slate-400 print:hidden">
                    <FileText className="h-5 w-5" />
                </div>
                <div className="max-w-md space-y-4 text-sm text-slate-500 italic">
                    <p>© {year} {author}. Reservados todos los derechos.</p>
                    <p>Ninguna parte de esta publicación puede ser reproducida, distribuida o transmitida en cualquier forma o por cualquier medio, incluyendo fotocopias, grabaciones u otros métodos electrónicos o mecánicos, sin el permiso previo por escrito del editor.</p>
                    {isbn && <p>ISBN: {isbn}</p>}
                </div>
            </div>
        )
    }

    return (
        <div className={containerClasses}>
            <div className="absolute -left-12 top-8 text-blue-500/30">
                <FileText className="h-6 w-6" />
            </div>
            <div className="max-w-md space-y-6">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Año de Publicación</label>
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => updateBlock(block.id, {
                                properties: { ...block.properties, year: parseInt(e.target.value) }
                            })}
                            className="w-full bg-transparent border-b border-slate-200 py-1 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Autor / Titular del Copyright</label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => updateBlock(block.id, {
                                properties: { ...block.properties, author: e.target.value }
                            })}
                            placeholder="Nombre del autor o empresa"
                            className="w-full bg-transparent border-b border-slate-200 py-1 focus:border-blue-500 outline-none font-medium text-slate-800"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">ISBN (Opcional)</label>
                        <input
                            type="text"
                            value={isbn}
                            onChange={(e) => updateBlock(block.id, {
                                properties: { ...block.properties, isbn: e.target.value }
                            })}
                            placeholder="0-00-000000-0"
                            className="w-full bg-transparent border-b border-slate-200 py-1 focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-400 leading-relaxed uppercase tracking-tight">
                    ESTE BLOQUE GENERA AUTOMÁTICAMENTE EL TEXTO LEGAL DE COPYRIGHT PARA TU EBOOK.
                </div>
            </div>
        </div>
    )
}
