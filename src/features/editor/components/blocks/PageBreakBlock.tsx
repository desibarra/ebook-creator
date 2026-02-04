
import { Block } from '@/features/projects/types'
import { FileText } from 'lucide-react'

interface PageBreakBlockProps {
    block: Block
}

export function PageBreakBlock({ block }: PageBreakBlockProps) {
    return (
        <div className="page-break-indicator group">
            <div className="page-break-label hover:bg-blue-600 hover:text-white transition-colors cursor-default">
                <FileText className="h-3 w-3" />
                PAGE BREAK
            </div>
            {/* Tooltip on hover */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded pointer-events-none whitespace-nowrap z-50">
                End of page. New page starts below.
            </div>
        </div>
    )
}
