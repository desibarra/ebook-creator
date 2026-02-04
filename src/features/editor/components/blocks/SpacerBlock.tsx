
'use client'

import { Block } from '@/features/projects/types'
import { cn } from '@/shared/lib/utils'

interface SpacerBlockProps {
    block: Block
}

export function SpacerBlock({ block }: SpacerBlockProps) {
    const height = block.properties?.height || 40

    return (
        <div
            className="w-full flex items-center justify-center border-y border-dashed border-slate-100 hover:border-slate-300 transition-colors group relative"
            style={{ height: `${height}px` }}
        >
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Espacio en Blanco ({height}px)
            </span>
            {block.content && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none overflow-hidden">
                    <p className="text-[10px] truncate">{block.content}</p>
                </div>
            )}
        </div>
    )
}
