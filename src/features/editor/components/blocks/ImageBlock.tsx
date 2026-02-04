
import { useRef, useState } from 'react'
import { Block } from '@/features/projects/types'
import { useEditorStore } from '@/features/editor/store/useEditorStore'
import { Image as ImageIcon, Upload, Link, Loader2, X, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { uploadImage, deleteImage } from '@/lib/supabase/imageUpload'
import { toast } from 'sonner'

interface ImageBlockProps {
    block: Block
}

export function ImageBlock({ block }: ImageBlockProps) {
    const updateBlock = useEditorStore((state) => state.updateBlock)
    const project = useEditorStore((state) => state.project)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadMode, setUploadMode] = useState<'url' | 'file' | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value
        updateBlock(block.id, { content: newUrl })
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !project) return

        setIsUploading(true)
        try {
            // Get user ID from project or store
            const { createClient } = await import('@/shared/lib/supabase/client')
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error('No estás autenticado')

            const publicUrl = await uploadImage(file, user.id, project.id)
            updateBlock(block.id, { content: publicUrl, properties: { ...block.properties, storagePath: true } })
            toast.success('Imagen subida con éxito')
            setUploadMode(null)
        } catch (error: any) {
            toast.error(error.message || 'Error al subir la imagen')
        } finally {
            setIsUploading(false)
        }
    }

    const handleDelete = async () => {
        if (block.content && block.properties?.storagePath) {
            await deleteImage(block.content)
        }
        updateBlock(block.id, { content: '', properties: { ...block.properties, storagePath: false } })
        setUploadMode(null)
    }

    if (!block.content) {
        return (
            <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-6 text-muted-foreground bg-muted/5 hover:bg-muted/10 transition-all">
                <div className="p-4 bg-muted/20 rounded-full">
                    <ImageIcon className="h-10 w-10 opacity-40 text-blue-500" />
                </div>

                <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                    <p className="font-medium text-sm">Añade una imagen a tu eBook</p>

                    <div className="flex gap-2 w-full">
                        <Button
                            variant="outline"
                            className="flex-1 gap-2 text-xs h-9"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            Subir desde PC
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 gap-2 text-xs h-9"
                            onClick={() => setUploadMode(uploadMode === 'url' ? null : 'url')}
                        >
                            <Link className="h-4 w-4" />
                            Usar URL
                        </Button>
                    </div>

                    {uploadMode === 'url' && (
                        <div className="w-full animate-in fade-in slide-in-from-top-2">
                            <Input
                                placeholder="Pega la URL de la imagen (Canva, Unsplash, etc)..."
                                value={block.content}
                                onChange={handleUrlChange}
                                className="h-9 text-xs border-blue-200 focus-visible:ring-blue-500"
                                autoFocus
                            />
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="relative group rounded-xl overflow-hidden border bg-muted/30">
            {/* Image Display */}
            <img
                src={block.content}
                alt={block.properties?.alt || 'Imagen del eBook'}
                className="w-full max-h-[600px] object-contain mx-auto"
            />

            {/* Overlay controls */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-lg"
                    onClick={handleDelete}
                    title="Eliminar imagen"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2 items-center">
                    <Input
                        value={block.properties?.alt || ''}
                        onChange={(e) => updateBlock(block.id, { properties: { ...block.properties, alt: e.target.value } })}
                        placeholder="Texto alternativo (alt text)..."
                        className="h-8 text-[11px] bg-white/90 border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                    />
                    <Input
                        value={block.properties?.caption || ''}
                        onChange={(e) => updateBlock(block.id, { properties: { ...block.properties, caption: e.target.value } })}
                        placeholder="Leyenda (caption)..."
                        className="h-8 text-[11px] bg-white/90 border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    )
}
