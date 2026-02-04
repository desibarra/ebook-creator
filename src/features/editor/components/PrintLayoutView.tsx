
'use client'

import React, { useMemo } from 'react'
import { Block } from '@/features/projects/types'
import { BlockRenderer } from './blocks/BlockRenderer'
import { FileText, Ruler } from 'lucide-react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import '../styles/print-layout.css'

interface PrintLayoutViewProps {
    blocks: Block[]
}

// A4 Configuration in pixels (96dpi)
export const PAGE_CONFIG = {
    width: 794,   // 210mm
    height: 1123,  // 297mm
    margin: 75,    // ~20mm
}

export function PrintLayoutView({ blocks }: PrintLayoutViewProps) {
    // Split blocks into pages, KEEPING the page-break blocks in the flow
    const pages = useMemo(() => {
        const result: Block[][] = [[]]
        let currentPageIndex = 0

        blocks.forEach((block) => {
            result[currentPageIndex].push(block)
            if (block.type === 'page-break') {
                result.push([])
                currentPageIndex++
            }
        })

        return result
    }, [blocks])

    return (
        <div id="ebook-canvas" className="bg-gray-200/50 min-h-full p-8 pt-12">
            <div className="max-w-fit mx-auto relative">
                {/* Horizontal Ruler - Adjusted to sit below the chapter indicator */}
                <div className="sticky top-[48px] z-40 bg-gray-100 flex h-6 border-b border-gray-300 mb-4 rounded-t-lg shadow-sm" style={{ width: PAGE_CONFIG.width }}>
                    {Array.from({ length: 22 }).map((_, i) => (
                        <div key={i} className="flex-1 border-r border-gray-300 text-[9px] text-gray-400 flex items-center justify-center font-mono">
                            {i}
                        </div>
                    ))}
                </div>

                <div className="flex">
                    {/* Vertical Ruler - Adjusted for the header and horizontal ruler */}
                    <div className="sticky top-[72px] h-fit bg-gray-100 w-6 border-r border-gray-300 rounded-l-lg shadow-sm mr-4" style={{ minHeight: PAGE_CONFIG.height }}>
                        {Array.from({ length: 30 }).map((_, i) => (
                            <div key={i} className="h-[37.8px] border-b border-gray-300 text-[9px] text-gray-400 flex items-center justify-center font-mono">
                                {i}
                            </div>
                        ))}
                    </div>

                    <div className="space-y-12">
                        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                            {pages.map((pageBlocks, index) => {
                                // Encontrar el capítulo actual para esta página
                                // Buscamos el último H1 que ocurrió antes o en esta página
                                let pageChapter = ""
                                // Primero buscamos en los bloques de esta página
                                const h1InPage = [...pageBlocks].reverse().find(b => b.type === 'heading' && b.properties?.level === 1)
                                if (h1InPage) {
                                    pageChapter = h1InPage.content.replace(/<[^>]*>?/gm, '')
                                } else {
                                    // Si no hay H1 en esta página, buscamos en los bloques anteriores del documento
                                    let lastH1Index = -1
                                    blocks.forEach((b, i) => {
                                        // Si el bloque actual está en una página anterior
                                        const isEarlier = pages.slice(0, index).some(p => p.some(pb => pb.id === b.id))
                                        if (isEarlier && b.type === 'heading' && b.properties?.level === 1) {
                                            pageChapter = b.content.replace(/<[^>]*>?/gm, '')
                                        }
                                    })
                                }

                                return (
                                    <div
                                        key={index}
                                        className="bg-white shadow-2xl relative print-page"
                                        style={{
                                            width: PAGE_CONFIG.width,
                                            height: PAGE_CONFIG.height,
                                            padding: `${PAGE_CONFIG.margin}px`,
                                            paddingBottom: '100px', // Extra padding for footer
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        {/* Page Info Header (Non-printable) */}
                                        <div className="absolute -top-7 left-0 right-0 flex justify-between items-center px-1 print:hidden">
                                            <div className="text-[10px] font-bold text-gray-500 flex items-center gap-1 bg-gray-100/80 px-2 py-0.5 rounded">
                                                <Ruler className="h-3 w-3" />
                                                <span>PAGINA {index + 1} DE {pages.length}</span>
                                            </div>
                                            {pageBlocks.length > 20 && (
                                                <div className="text-[10px] font-bold text-amber-600 animate-pulse">
                                                    ⚠️ POSIBLE DESBORDE
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Area */}
                                        <div className="relative z-10 space-y-4 h-full overflow-hidden">
                                            {pageBlocks.map((block) => (
                                                <BlockRenderer key={block.id} block={block} />
                                            ))}

                                            {/* Empty State */}
                                            {pageBlocks.length === 0 && (
                                                <div className="flex flex-col items-center justify-center h-[200px] border-2 border-dashed border-gray-100 rounded-xl text-gray-200">
                                                    <FileText className="h-8 w-8 mb-2 opacity-10" />
                                                    <p className="text-xs font-medium">Página Vacía</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Visual Margins Guide (Non-printable) */}
                                        <div className="absolute inset-[75px] border border-dashed border-blue-200/30 pointer-events-none z-0 print:hidden" />

                                        {/* Footer Profesional (Visible e Imprimible) */}
                                        <div className="absolute bottom-0 left-0 right-0 px-[75px] pb-8 pt-4 pointer-events-none">
                                            <div className="border-t border-gray-200 flex justify-between items-center pt-4 text-[10px] text-gray-400 font-medium">
                                                {/* Capítulo (Izquierda) */}
                                                <span className="uppercase tracking-widest truncate max-w-[250px]">
                                                    {pageChapter || ""}
                                                </span>

                                                {/* Número de página (Centro) */}
                                                <span className="absolute left-1/2 transform -translate-x-1/2 bg-white px-2">
                                                    {index + 1}
                                                </span>

                                                {/* Decoración (Derecha) */}
                                                <div className="h-1 w-12 bg-gray-100 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </SortableContext>
                    </div>
                </div>
            </div>
        </div>
    )
}
