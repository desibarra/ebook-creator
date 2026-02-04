
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { Markdown } from 'tiptap-markdown'
import { useEffect, useState, useMemo } from 'react'
import {
    Bold, Italic, List, ListOrdered,
    AlignLeft, AlignCenter, AlignRight,
    Undo, Redo, Type, Plus, Minus
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    onBlur?: () => void
    placeholder?: string
    className?: string
    fontSize?: number
    onFontSizeChange?: (size: number) => void
    showToolbar?: boolean
    useHtml?: boolean
}

export function RichTextEditor({
    content,
    onChange,
    onBlur,
    placeholder,
    className,
    fontSize = 16,
    onFontSizeChange,
    showToolbar = true,
    useHtml = true // Default to HTML to preserve alignment and complex formatting
}: RichTextEditorProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const extensionsMemo = useMemo(() => [
        StarterKit.configure({
            paragraph: {
                HTMLAttributes: {
                    class: 'mb-4',
                },
            },
        }),
        Underline,
        Placeholder.configure({
            placeholder: placeholder || 'Start typing...',
        }),
        TextAlign.configure({
            types: ['heading', 'paragraph', 'bulletList', 'orderedList'],
        }),
        Markdown.configure({
            html: true,
        }),
    ], [placeholder])

    const editor = useEditor({
        immediatelyRender: false,
        extensions: extensionsMemo,
        content: content,
        onUpdate: ({ editor }) => {
            const output = useHtml ? editor.getHTML() : (editor.storage as any).markdown.getMarkdown()
            onChange(output)
        },
        onBlur: () => {
            onBlur?.()
        },
        editorProps: {
            attributes: {
                class: cn('focus:outline-none min-h-[40px] w-full', className),
            },
        },
    })

    // Update content if it changes externally
    useEffect(() => {
        if (editor && isMounted) {
            const currentContent = useHtml ? editor.getHTML() : (editor.storage as any).markdown.getMarkdown()
            if (content !== currentContent) {
                editor.commands.setContent(content)
            }
        }
    }, [content, editor, isMounted, useHtml])

    if (!editor || !isMounted) {
        return <div className={cn("min-h-[40px] w-full", className)} style={{ fontSize: `${fontSize}px` }}>{content}</div>
    }

    const ToolbarButton = ({
        onClick,
        isActive,
        children,
        title,
        disabled = false
    }: {
        onClick: () => void,
        isActive?: boolean,
        children: React.ReactNode,
        title?: string,
        disabled?: boolean
    }) => (
        <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClick()
            }}
            className={cn(
                "h-7 w-7 p-0",
                isActive && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            )}
            title={title}
        >
            {children}
        </Button>
    )

    return (
        <div className="w-full relative group/editor">
            {/* Toolbar - Only visible when editor has focus or is hovered */}
            {showToolbar && (
                <div className="flex flex-wrap items-center gap-0.5 mb-2 bg-background/95 backdrop-blur-sm border rounded-lg p-1 shadow-sm opacity-0 group-focus-within/editor:opacity-100 transition-opacity z-50 sticky top-0">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Bold (Ctrl+B)"
                    >
                        <Bold className="h-3.5 w-3.5" />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Italic (Ctrl+I)"
                    >
                        <Italic className="h-3.5 w-3.5" />
                    </ToolbarButton>

                    <div className="w-px h-4 bg-border mx-1" />

                    <div className="flex items-center gap-0.5">
                        <ToolbarButton
                            onClick={() => onFontSizeChange?.(Math.max(10, fontSize - 1))}
                            title="Decrease Font Size"
                        >
                            <div className="relative">
                                <Type className="h-3 w-3" />
                                <Minus className="h-2 w-2 absolute -bottom-1 -right-1" />
                            </div>
                        </ToolbarButton>
                        <span className="text-[10px] w-4 text-center font-medium text-muted-foreground">{fontSize}</span>
                        <ToolbarButton
                            onClick={() => onFontSizeChange?.(Math.min(72, fontSize + 1))}
                            title="Increase Font Size"
                        >
                            <div className="relative">
                                <Type className="h-3 w-3" />
                                <Plus className="h-2 w-2 absolute -bottom-1 -right-1" />
                            </div>
                        </ToolbarButton>
                    </div>

                    <div className="w-px h-4 bg-border mx-1" />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Bullet List"
                    >
                        <List className="h-3.5 w-3.5" />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Numbered List"
                    >
                        <ListOrdered className="h-3.5 w-3.5" />
                    </ToolbarButton>

                    <div className="w-px h-4 bg-border mx-1" />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        isActive={editor.isActive({ textAlign: 'left' })}
                        title="Align Left"
                    >
                        <AlignLeft className="h-3.5 w-3.5" />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        isActive={editor.isActive({ textAlign: 'center' })}
                        title="Align Center"
                    >
                        <AlignCenter className="h-3.5 w-3.5" />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        isActive={editor.isActive({ textAlign: 'right' })}
                        title="Align Right"
                    >
                        <AlignRight className="h-3.5 w-3.5" />
                    </ToolbarButton>

                    <div className="w-px h-4 bg-border mx-1" />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo className="h-3.5 w-3.5" />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo className="h-3.5 w-3.5" />
                    </ToolbarButton>
                </div>
            )}

            <div
                className={cn(
                    "prose prose-sm dark:prose-invert max-w-none transition-all duration-200 rounded-md p-1 min-h-[30px]",
                    editor.isFocused && "ring-2 ring-blue-500/20"
                )}
                style={{ fontSize: `${fontSize}px` }}
                onClick={() => editor.chain().focus().run()}
            >
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
