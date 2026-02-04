
'use client'

import { useEditor, EditorContent, Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Markdown } from 'tiptap-markdown'
import { useEffect, useState, useMemo } from 'react'
import {
    Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
    AlignLeft, AlignCenter, AlignRight,
    Undo, Redo, Type, Plus, Minus
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

/**
 * Custom Extension for font size management in Tiptap
 * Saves font-size as inline styles in the HTML output.
 */
const FontSizeExtension = Extension.create({
    name: 'fontSize',

    addOptions() {
        return {
            types: ['textStyle'],
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setFontSize: (fontSize: string) => ({ chain }: { chain: any }) => {
                return chain()
                    .setMark('textStyle', { fontSize })
                    .run();
            },
            unsetFontSize: () => ({ chain }: { chain: any }) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run();
            },
        } as any;
    },
});

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    onBlur?: () => void
    placeholder?: string
    className?: string
    fontSize?: number // Mantener por compatibilidad de interfaz inicial
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
    useHtml = true
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
        TextStyle,
        Color,
        FontSizeExtension,
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
            console.log('📝 Editor Update - HTML Output:', output)
            onChange(output)
        },
        onBlur: () => {
            console.log('💾 Editor Blur - Saving content')
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

    // Helper functions for font size manipulation
    const handleIncreaseFontSize = () => {
        const currentAttributes = editor.getAttributes('textStyle');
        const currentSize = currentAttributes.fontSize;
        const currentPx = currentSize ? parseInt(currentSize) : fontSize;
        const newSize = Math.min(72, currentPx + 2);

        // Log locally
        onFontSizeChange?.(newSize);

        // Apply to editor selection
        (editor.chain().focus() as any).setFontSize(`${newSize}px`).run();
    }

    const handleDecreaseFontSize = () => {
        const currentAttributes = editor.getAttributes('textStyle');
        const currentSize = currentAttributes.fontSize;
        const currentPx = currentSize ? parseInt(currentSize) : fontSize;
        const newSize = Math.max(8, currentPx - 2);

        // Log locally
        onFontSizeChange?.(newSize);

        // Apply to editor selection
        (editor.chain().focus() as any).setFontSize(`${newSize}px`).run();
    }

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

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        title="Underline (Ctrl+U)"
                    >
                        <UnderlineIcon className="h-3.5 w-3.5" />
                    </ToolbarButton>

                    <div className="w-px h-4 bg-border mx-1" />

                    <div className="flex items-center gap-0.5">
                        <ToolbarButton
                            onClick={handleDecreaseFontSize}
                            title="Decrease Font Size"
                        >
                            <div className="relative">
                                <Type className="h-3 w-3" />
                                <Minus className="h-2 w-2 absolute -bottom-1 -right-1" />
                            </div>
                        </ToolbarButton>
                        <span className="text-[10px] w-6 text-center font-bold text-blue-600 bg-blue-50 rounded">
                            {editor.getAttributes('textStyle').fontSize ? parseInt(editor.getAttributes('textStyle').fontSize) : fontSize}
                        </span>
                        <ToolbarButton
                            onClick={handleIncreaseFontSize}
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
