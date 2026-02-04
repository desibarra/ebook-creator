
import { memo } from 'react'
import { Block } from '@/features/projects/types'
import { BlockWrapper } from './BlockWrapper'
import { TextBlock } from './TextBlock'
import { HeadingBlock } from './HeadingBlock'
import { ImageBlock } from './ImageBlock'

import { DividerBlock } from './DividerBlock'
import { PageBreakBlock } from './PageBreakBlock'
import { TableOfContentsBlock } from './TableOfContentsBlock'
import { CoverPageBlock } from './CoverPageBlock'

import { CopyrightPageBlock } from './CopyrightPageBlock'
import { SpacerBlock } from './SpacerBlock'

interface BlockRendererProps {
    block: Block
}

export const BlockRenderer = memo(({ block }: BlockRendererProps) => {
    const renderContent = () => {
        switch (block.type) {
            case 'heading':
                return <HeadingBlock block={block} />
            case 'image':
                return <ImageBlock block={block} />
            case 'divider':
                return <DividerBlock block={block} />
            case 'page-break':
                return <PageBreakBlock block={block} />
            case 'table-of-contents':
                return <TableOfContentsBlock block={block} />
            case 'cover':
                return <CoverPageBlock block={block} />
            case 'copyright':
                return <CopyrightPageBlock block={block} />
            case 'spacer':
                return <SpacerBlock block={block} />
            case 'text':
            default:
                return <TextBlock block={block} />
        }
    }

    return (
        <BlockWrapper block={block}>
            {renderContent()}
        </BlockWrapper>
    )
})

BlockRenderer.displayName = 'BlockRenderer'
