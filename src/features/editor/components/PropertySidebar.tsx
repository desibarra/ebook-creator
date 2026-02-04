
'use client'

import { useEditorStore } from '@/features/editor/store/useEditorStore'
import {
    Info,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Layers,
    FileText,
    Heading as HeadingIcon,
    Image as ImageIcon,
    SeparatorHorizontal,
    Scissors,
    ChevronRight,
    Search,
    Sparkles
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/shared/components/ui/select'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Block } from '@/features/projects/types'

export function PropertySidebar() {
    const selectedBlockId = useEditorStore(state => state.selectedBlockId)
    const blocks = useEditorStore(state => state.blocks)
    const updateBlock = useEditorStore(state => state.updateBlock)
    const selectBlock = useEditorStore(state => state.selectBlock)

    const selectedBlock = blocks.find(b => b.id === selectedBlockId)

    // Stats
    const totalBlocks = blocks.length
    const wordCount = blocks.reduce((acc, block) => acc + (block.content?.split(/\s+/).filter(Boolean).length || 0), 0)
    const estPages = Math.ceil(wordCount / 250)

    const getBlockIcon = (type: string) => {
        switch (type) {
            case 'heading': return <HeadingIcon className="h-4 w-4" />
            case 'image': return <ImageIcon className="h-4 w-4" />
            case 'divider': return <SeparatorHorizontal className="h-4 w-4" />
            case 'page-break': return <Scissors className="h-4 w-4" />
            default: return <FileText className="h-4 w-4" />
        }
    }

    const getBlockLabel = (type: string, content?: string) => {
        if (type === 'heading') return content?.replace(/<[^>]*>?/gm, '').trim() || 'Heading'
        switch (type) {
            case 'image': return 'Imagen'
            case 'divider': return 'Divisor'
            case 'page-break': return 'Salto de Página'
            case 'cover': return 'Portada'
            case 'copyright': return 'Copyright'
            case 'table-of-contents': return 'Índice'
            default: return content?.replace(/<[^>]*>?/gm, '').slice(0, 30).trim() + (content && content.length > 30 ? '...' : '') || 'Texto'
        }
    }

    const scrollToBlock = (id: string) => {
        selectBlock(id)
        const element = document.querySelector(`[data-block-id="${id}"]`)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    return (
        <aside className="w-80 border-l bg-background flex flex-col h-full bg-slate-50/50 hidden lg:flex">
            {/* 1. Header & Quick Stats */}
            <div className="p-4 border-b bg-white">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="h-3 w-3 text-blue-600" />
                        Estructura del Proyecto
                    </h2>
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                        {estPages} Págs
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Bloques</p>
                        <p className="text-xs font-black text-slate-700">{totalBlocks}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Palabras</p>
                        <p className="text-xs font-black text-slate-700">{wordCount.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* 2. Block Properties (Floating/Conditional Panel) */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {selectedBlock ? (
                    <div className="p-4 bg-white border-b shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                                    {getBlockIcon(selectedBlock.type)}
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 leading-none">Propiedades</h3>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight mt-1">{selectedBlock.type}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => selectBlock(null)}>
                                ×
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {selectedBlock.type === 'heading' && (
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Nivel</label>
                                    <Select
                                        value={String(selectedBlock.properties?.level || 1)}
                                        onValueChange={(val) => updateBlock(selectedBlock.id, { properties: { ...selectedBlock.properties, level: parseInt(val) } })}
                                    >
                                        <SelectTrigger className="h-8 text-xs font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">H1 - Título de Capítulo</SelectItem>
                                            <SelectItem value="2">H2 - Subtítulo Principal</SelectItem>
                                            <SelectItem value="3">H3 - Sección Menor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {(selectedBlock.type === 'heading' || selectedBlock.type === 'text') && (
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Alineación</label>
                                    <div className="flex bg-slate-100 p-0.5 rounded-md">
                                        {['left', 'center', 'right'].map((align) => (
                                            <Button
                                                key={align}
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    "flex-1 h-7 rounded-[4px]",
                                                    (selectedBlock.properties?.align === align || (!selectedBlock.properties?.align && align === 'left')) && "bg-white shadow-sm text-blue-600"
                                                )}
                                                onClick={() => updateBlock(selectedBlock.id, { properties: { ...selectedBlock.properties, align } })}
                                            >
                                                {align === 'left' && <AlignLeft className="h-3.5 w-3.5" />}
                                                {align === 'center' && <AlignCenter className="h-3.5 w-3.5" />}
                                                {align === 'right' && <AlignRight className="h-3.5 w-3.5" />}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-8 text-[10px] font-bold border-red-100 text-red-600 hover:bg-red-50"
                                    onClick={() => useEditorStore.getState().deleteBlock(selectedBlock.id)}
                                >
                                    Eliminar
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 text-center border-b bg-white/50">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Info className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Selecciona un bloque</p>
                        <p className="text-[10px] text-slate-400 mt-1 italic">Para editar sus propiedades</p>
                    </div>
                )}

                {/* 3. Document Navigator (Fills Space) */}
                <div className="flex-1 flex flex-col min-h-0 bg-white">
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Navegador</h3>
                        <Search className="h-3 w-3 text-slate-400" />
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {blocks.map((b, idx) => (
                                <button
                                    key={b.id}
                                    onClick={() => scrollToBlock(b.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all group",
                                        selectedBlockId === b.id ? "bg-blue-50 border-blue-100" : "hover:bg-slate-50 active:bg-slate-100"
                                    )}
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded flex items-center justify-center shrink-0 text-[10px] font-bold",
                                        selectedBlockId === b.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                                    )}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className={cn(
                                                "p-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
                                                b.type === 'heading' ? "bg-amber-100 text-amber-700" :
                                                    b.type === 'page-break' ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500"
                                            )}>
                                                {b.type}
                                            </span>
                                        </div>
                                        <p className={cn(
                                            "text-[11px] truncate leading-none",
                                            selectedBlockId === b.id ? "text-blue-900 font-bold" : "text-slate-600"
                                        )}>
                                            {getBlockLabel(b.type, b.content)}
                                        </p>
                                    </div>
                                    <ChevronRight className={cn(
                                        "h-3 w-3 opacity-0 group-hover:opacity-30",
                                        selectedBlockId === b.id && "opacity-100 text-blue-500"
                                    )} />
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* 4. Help Section */}
            <div className="p-4 border-t bg-slate-50">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase leading-none mb-1">Tip de Diseño</p>
                        <p className="text-[10px] text-slate-500 leading-tight">
                            Usa <span className="font-bold text-slate-700">Páginas de Salto</span> para separar capítulos y evitar desbordes.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
