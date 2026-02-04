import { Block } from '@/features/projects/types'

interface DividerBlockProps {
    block: Block
}

export function DividerBlock({ block }: DividerBlockProps) {
    return <hr className="my-8 border-t border-border" />
}
