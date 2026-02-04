
'use client'

import { useState } from 'react';
import { Upload, Edit, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { uploadImage } from '@/lib/supabase/imageUpload';
import { toast } from 'sonner';
import { Block } from '@/features/projects/types';
import { useEditorStore } from '@/features/editor/store/useEditorStore';
import { cn } from '@/shared/lib/utils';
import { useParams } from 'next/navigation';

interface CoverPageBlockProps {
    block: Block;
}

export function CoverPageBlock({ block }: CoverPageBlockProps) {
    const params = useParams();
    const projectId = params.id as string;
    const updateBlock = useEditorStore((state) => state.updateBlock);
    const selectedBlockId = useEditorStore((state) => state.selectedBlockId);
    const isSelected = selectedBlockId === block.id;

    const [isUploading, setIsUploading] = useState(false);
    const [showTextEditor, setShowTextEditor] = useState(block.properties?.showText ?? true);

    // Sync state if block properties change
    const coverImage = block.properties?.coverImage;
    const title = block.content || block.properties?.title || '';
    const subtitle = block.properties?.subtitle || '';
    const author = block.properties?.author || '';

    const onUpdate = (data: Record<string, unknown>) => {
        updateBlock(block.id, {
            properties: { ...block.properties, ...data }
        });
    };

    const handleImageUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Solo se permiten imágenes');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen debe ser menor a 5MB');
            return;
        }

        setIsUploading(true);
        try {
            // Assuming userId can be 'me' or we get it from store if needed
            // Actually imageUpload uses userId for path. Let's use 'cover' as fallback if not available
            const imageUrl = await uploadImage(file, 'user', projectId);
            onUpdate({ coverImage: imageUrl });
            toast.success('Portada subida correctamente');
        } catch (error: unknown) {
            console.error('Error uploading cover:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error al subir la imagen';
            toast.error('Error al subir la imagen: ' + errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files && files[0]) handleImageUpload(files[0]);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleImageUpload(file);
    };

    const handleRemoveImage = () => {
        onUpdate({ coverImage: null });
        toast.success('Imagen eliminada');
    };

    // State: No image
    if (!coverImage) {
        return (
            <div
                className={cn(
                    "relative w-full bg-slate-50 border-2 border-dashed border-slate-200 transition-all duration-300 flex items-center justify-center rounded-xl",
                    isSelected && "border-blue-400 bg-blue-50/30"
                )}
                style={{ minHeight: '600px' }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <div className="text-center p-12">
                    <div className="mb-6 relative group">
                        {isUploading ? (
                            <Loader2 className="mx-auto text-blue-500 animate-spin" size={64} />
                        ) : (
                            <div className="bg-white p-6 rounded-full shadow-sm mx-auto w-fit border border-slate-100 group-hover:scale-110 transition-transform">
                                <Upload size={48} className="text-blue-500" />
                            </div>
                        )}
                    </div>

                    <h3 className="text-3xl font-black mb-2 text-slate-800 tracking-tight">
                        Subir Imagen de Portada
                    </h3>

                    <p className="text-slate-500 mb-8 max-w-sm mx-auto text-lg">
                        Arrastra tu diseño profesional aquí o haz clic para buscar en tu equipo.
                    </p>

                    <div className="flex flex-col items-center gap-4">
                        <label className="inline-block">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileInput}
                                className="hidden"
                                disabled={isUploading}
                            />
                            <div className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 cursor-pointer hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2">
                                <RefreshCw size={20} className={isUploading ? "animate-spin" : ""} />
                                {isUploading ? 'Subiendo...' : 'Seleccionar Archivo'}
                            </div>
                        </label>

                        <button
                            onClick={() => onUpdate({ forceText: true, coverImage: 'placeholder' })}
                            className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-4"
                        >
                            No tengo imagen, usar solo texto
                        </button>
                    </div>

                    <p className="text-xs text-slate-400 mt-12 font-medium uppercase tracking-widest">
                        Recomendado: 1600x2400px (2:3) • JPG/PNG • Max 5MB
                    </p>
                </div>
            </div>
        );
    }

    // State: Has image
    return (
        <div
            className="relative w-full group overflow-hidden rounded-xl shadow-2xl transition-all duration-500"
            style={{ minHeight: '800px' }}
        >
            {/* Cover Image */}
            {coverImage !== 'placeholder' ? (
                <img
                    src={coverImage}
                    alt="Ebook Cover"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-blue-900" />
            )}

            {/* Scrim overlay when editing or text is shown */}
            {(showTextEditor || isSelected) && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-all duration-300" />
            )}

            {/* Floating Actions */}
            <div className="absolute top-6 right-6 flex flex-col sm:flex-row gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0 z-20">
                <label className="cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                    />
                    <div className="px-4 py-2 bg-white/90 backdrop-blur text-slate-900 font-bold rounded-xl shadow-lg flex items-center gap-2 hover:bg-white transition-all whitespace-nowrap">
                        <RefreshCw size={16} />
                        Reemplazar
                    </div>
                </label>

                <button
                    onClick={() => {
                        const newVal = !showTextEditor;
                        setShowTextEditor(newVal);
                        onUpdate({ showText: newVal });
                    }}
                    className="px-4 py-2 bg-white/90 backdrop-blur text-slate-900 font-bold rounded-xl shadow-lg flex items-center gap-2 hover:bg-white transition-all whitespace-nowrap"
                >
                    <Edit size={16} />
                    {showTextEditor ? 'Ocultar Texto' : 'Añadir Texto'}
                </button>

                <button
                    onClick={handleRemoveImage}
                    className="px-4 py-2 bg-red-500/90 backdrop-blur text-white font-bold rounded-xl shadow-lg flex items-center gap-2 hover:bg-red-600 transition-all whitespace-nowrap"
                >
                    <Trash2 size={16} />
                    Quitar
                </button>
            </div>

            {/* Text Overlay */}
            {showTextEditor && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white z-10 text-center">
                    <textarea
                        value={title}
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        placeholder="Título del Libro"
                        className="w-full text-5xl sm:text-7xl font-black mb-6 text-center bg-transparent border-none outline-none resize-none placeholder:text-white/30 drop-shadow-xl"
                        rows={2}
                    />

                    <input
                        type="text"
                        value={subtitle}
                        onChange={(e) => onUpdate({ subtitle: e.target.value })}
                        placeholder="Añade un subtítulo impactante"
                        className="w-full text-2xl font-medium mb-12 text-center bg-transparent border-none outline-none placeholder:text-white/40 drop-shadow-lg"
                    />

                    <div className="w-24 h-1 bg-white/50 mb-12 rounded-full" />

                    <input
                        type="text"
                        value={author}
                        onChange={(e) => onUpdate({ author: e.target.value })}
                        placeholder="Tu Nombre de Autor"
                        className="w-full text-xl font-bold text-center bg-transparent border-none outline-none uppercase tracking-[.3em] placeholder:text-white/40 drop-shadow-lg"
                    />
                </div>
            )}
        </div>
    );
}
