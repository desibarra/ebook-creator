'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Book, Copyright, List, Heart, MessageSquare, User, Library, Target, ArrowLeft, Loader2, Save, Sparkles, RefreshCw, Download, Eye, EyeOff, FileText, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

import { Canvas } from '@/features/editor/components/canvas/Canvas'
import { BlockRenderer } from '@/features/editor/components/blocks/BlockRenderer'
import { PropertySidebar } from '@/features/editor/components/PropertySidebar'
import { useEditorStore } from '@/features/editor/store/useEditorStore'
import { projectService } from '@/features/projects/services/projectService'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/shared/components/ui/dropdown-menu"
import BulkGenerateModal, { GenerationOptions } from '@/features/editor/components/modals/BulkGenerateModal'
import NotebookLMPromptModal from '@/features/editor/components/modals/NotebookLMPromptModal'
import ChapterReviewPanel, { Chapter } from '@/features/editor/components/ChapterReviewPanel'
import { markdownToBlocks } from '@/lib/utils/markdown-to-blocks'
import { Block } from '@/features/projects/types'
import { EbookSectionType, EBOOK_SECTION_TEMPLATES } from '@/lib/templates/ebook-section-templates'
import { exportToWord } from '@/lib/export/exportToWord'
import { exportToEpub } from '@/lib/export/exportToEpub'
import { blocksToChapters } from '@/lib/export/prepareEpubData'

export default function EditorPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const setProject = useEditorStore(state => state.setProject)
    const project = useEditorStore(state => state.project)
    const save = useEditorStore(state => state.save)
    const addBlock = useEditorStore(state => state.addBlock)
    const addBlocks = useEditorStore(state => state.addBlocks)
    const updateBlock = useEditorStore(state => state.updateBlock)
    const setMode = useEditorStore(state => state.setMode)
    const mode = useEditorStore(state => state.mode)
    const blocks = useEditorStore(state => state.blocks)
    // const selectedBlockId = useEditorStore(state => state.selectedBlockId)
    const viewMode = useEditorStore(state => state.viewMode)
    const setViewMode = useEditorStore(state => state.setViewMode)

    const [loading, setLoading] = useState(true)
    const [showBulkModal, setShowBulkModal] = useState(false)
    const [showPromptModal, setShowPromptModal] = useState(false)
    const [showReviewPanel, setShowReviewPanel] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedChapters, setGeneratedChapters] = useState<Chapter[]>([])
    // const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 })
    const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const isPreviewMode = mode === 'preview';

    // Derived states
    const wordCount = blocks.reduce((acc, block) => acc + (block.content?.split(/\s+/).filter(Boolean).length || 0), 0);
    const estimatedPages = Math.ceil(wordCount / 250);

    // Onboarding tracking
    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('ebook-onboarding-seen');
        if (!hasSeenOnboarding) {
            setShowOnboarding(true);
        }
    }, []);

    const dismissOnboarding = () => {
        localStorage.setItem('ebook-onboarding-seen', 'true');
        setShowOnboarding(false);
    };

    // Protection against accidental closure during generation
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isGenerating) {
                e.preventDefault();
                e.returnValue = 'Your eBook is still generating. Are you sure you want to leave?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isGenerating]);

    // Simple countdown for estimated time
    useEffect(() => {
        if (!isGenerating || estimatedTimeRemaining === null) return;

        const interval = setInterval(() => {
            setEstimatedTimeRemaining(prev => prev ? Math.max(0, prev - 1) : 0);
        }, 1000);

        return () => clearInterval(interval);
    }, [isGenerating, estimatedTimeRemaining]);

    useEffect(() => {
        if (!blocks.length && !project) return;

        const timeoutId = setTimeout(() => {
            // Only auto-save if something changed
            save(true)
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [blocks, project, save]);

    useEffect(() => {
        async function load() {
            try {
                const projectData = await projectService.getProjectById(id as string)
                if (!projectData) throw new Error('Project not found')
                setProject(projectData)
            } catch (e: unknown) {
                console.error('Load failed:', e)
                const errorMessage = e instanceof Error ? e.message : 'Error al cargar el proyecto';
                toast.error(errorMessage)
                // Solo redirigir si es un error fatal de autenticación o ID inexistente
                if (errorMessage.includes('auth') || errorMessage.includes('not found')) {
                    router.push('/dashboard')
                }
            } finally {
                setLoading(false)
            }
        }
        if (id) {
            load()
        }
    }, [id, setProject, router]);

    const handleBulkGenerate = async (analysis: string, options: GenerationOptions) => {
        if (analysis.length < 500) {
            toast.error('The analysis is too short. Please paste a more complete analysis from NotebookLM (minimum 500 characters).');
            return;
        }

        const chapterMatches = analysis.match(/(?:Capítulo|Chapter|Tema)\s*\d+/gi);
        if (!chapterMatches || chapterMatches.length < 2) {
            toast.warning('We detected very few chapters. The analysis might be incomplete.');
        }

        if (chapterMatches && chapterMatches.length > 20) {
            toast.error('Too many chapters detected (>20). Please split the analysis into multiple projects.');
            return;
        }

        setIsGenerating(true);
        setShowBulkModal(false);
        setEstimatedTimeRemaining((chapterMatches?.length || 5) * 45); // Approx 45s per chapter

        try {
            const response = await fetch('/api/ai/generate-full-ebook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysis,
                    ebookContext: {
                        title: project?.title || 'Untitled',
                        targetAudience: 'General',
                        category: 'General'
                    },
                    options
                })
            });

            if (!response.ok) throw new Error('Generation failed');

            const data = await response.json();

            if (data.success) {
                setGeneratedChapters(data.chapters);

                if (options.autoApprove) {
                    const allBlocks: Block[] = [];
                    data.chapters.forEach((ch: Chapter, idx: number) => {
                        const chapterNumber = idx + 1;
                        let cleanedContent = ch.content.trim();

                        const lines = cleanedContent.split('\n');
                        const firstLine = lines[0]?.trim() || '';
                        if (firstLine.startsWith('#')) {
                            const firstHeading = firstLine.replace(/^#+\s*/, '').trim();
                            const chapterTitle = ch.title.trim();
                            if (firstHeading === chapterTitle || firstHeading.includes(chapterTitle) || chapterTitle.includes(firstHeading)) {
                                cleanedContent = lines.slice(1).join('\n').trim();
                            }
                        }

                        allBlocks.push({
                            id: nanoid(),
                            type: 'heading',
                            content: `Capítulo ${chapterNumber}: ${ch.title}`,
                            properties: { level: 1 }
                        });

                        allBlocks.push({ id: nanoid(), type: 'spacer', content: '' });

                        const chapterBlocks = markdownToBlocks(cleanedContent);
                        allBlocks.push(...chapterBlocks);

                        if (idx < data.chapters.length - 1) {
                            allBlocks.push({ id: nanoid(), type: 'page-break', content: '' });
                        }
                    });

                    useEditorStore.getState().addBlocks(allBlocks);

                    setShowCelebration(true);
                    setTimeout(() => setShowCelebration(false), 4000);

                    toast.success(
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🎉</span>
                            <div>
                                <div className="font-bold text-lg">¡eBook generado exitosamente!</div>
                                <div className="text-sm opacity-90">{data.chapters.length} capítulos añadidos automáticamente.</div>
                            </div>
                        </div>,
                        {
                            duration: 5000,
                            style: {
                                background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                                color: 'white',
                                padding: '16px',
                                borderRadius: '12px',
                                fontWeight: 500
                            }
                        }
                    );
                } else {
                    setShowReviewPanel(true);
                    toast.success(`✨ Generation complete! ${data.chapters.length} chapters are ready for your review.`);
                }
            } else {
                throw new Error(data.error);
            }

        } catch (error: unknown) {
            console.error('❌ Bulk generation error:', error);
            toast.error('Oops! We couldn\'t generate your eBook. Please check your data and try again.');
        } finally {
            setIsGenerating(false);
            setEstimatedTimeRemaining(null);
        }
    };

    const handleApproveChapter = async (chapterId: string) => {
        setGeneratedChapters(prev =>
            prev.map(ch =>
                ch.id === chapterId ? { ...ch, status: 'approved' } : ch
            )
        );
        toast.success('Chapter approved! Ready for import ✅');
    };

    const handleRejectChapter = async (chapterId: string) => {
        setGeneratedChapters(prev =>
            prev.map(ch =>
                ch.id === chapterId ? { ...ch, status: 'rejected' } : ch
            )
        );
        toast.warning('Chapter rejected ❌');
    };

    const handleRegenerateChapter = async (chapterId: string, retryCount = 0) => {
        const chapter = generatedChapters.find(ch => ch.id === chapterId);
        if (!chapter) return;

        const loadingToast = toast.loading(retryCount > 0 ? `Retrying regeneration (Attempt ${retryCount + 1})...` : 'Regenerating chapter...');

        try {
            const response = await fetch('/api/ai/regenerate-chapter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chapterTitle: chapter.title,
                    currentContent: chapter.content,
                    improvementType: 'general',
                    ebookContext: {
                        title: project?.title || 'Untitled',
                        category: 'General'
                    }
                })
            });

            if (!response.ok) throw new Error('Regeneration failed');

            const data = await response.json();

            if (data.success) {
                setGeneratedChapters(prev =>
                    prev.map(ch =>
                        ch.id === chapterId
                            ? { ...ch, content: data.content, status: 'draft' }
                            : ch
                    )
                );
                toast.dismiss(loadingToast);
                toast.success('Chapter regenerated ✨');
            }
        } catch {
            toast.dismiss(loadingToast);
            if (retryCount < 2) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                return handleRegenerateChapter(chapterId, retryCount + 1);
            }
            toast.error('Failed to regenerate after multiple attempts. Please try again later.');
        }
    };

    const handleEditChapter = async (chapterId: string, newContent: string) => {
        setGeneratedChapters(prev =>
            prev.map(ch =>
                ch.id === chapterId ? { ...ch, content: newContent } : ch
            )
        );
    };

    const handleFinishReview = async (approvedChapters: Chapter[]) => {
        if (approvedChapters.length === 0) {
            toast.error('Por favor aprueba al menos un capítulo antes de finalizar.');
            return;
        }

        const loadingToast = toast.loading(`Importando ${approvedChapters.length} capítulos al editor...`);

        try {
            const allBlocks: Block[] = [];

            for (let idx = 0; idx < approvedChapters.length; idx++) {
                const chapter = approvedChapters[idx];
                const chapterNumber = idx + 1;

                let cleanedContent = chapter.content.trim();
                const lines = cleanedContent.split('\n');
                const firstLine = lines[0]?.trim() || '';

                if (firstLine.startsWith('#')) {
                    const firstHeading = firstLine.replace(/^#+\s*/, '').trim();
                    const chapterTitle = chapter.title.trim();

                    if (
                        firstHeading === chapterTitle ||
                        firstHeading.includes(chapterTitle) ||
                        chapterTitle.includes(firstHeading)
                    ) {
                        cleanedContent = lines.slice(1).join('\n').trim();
                    }
                }

                const fullTitle = `Capítulo ${chapterNumber}: ${chapter.title}`;

                allBlocks.push({
                    id: nanoid(),
                    type: 'heading',
                    content: fullTitle,
                    properties: { level: 1 }
                });

                allBlocks.push({
                    id: nanoid(),
                    type: 'spacer',
                    content: ''
                });

                const chapterBlocks = markdownToBlocks(cleanedContent);
                allBlocks.push(...chapterBlocks);

                if (idx < approvedChapters.length - 1) {
                    allBlocks.push({
                        id: nanoid(),
                        type: 'page-break',
                        content: ''
                    });
                }
            }

            useEditorStore.getState().addBlocks(allBlocks);

            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 4000);

            toast.dismiss(loadingToast);

            toast.success(
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🎉</span>
                    <div>
                        <div className="font-bold text-lg">¡eBook importado exitosamente!</div>
                        <div className="text-sm opacity-90">
                            {approvedChapters.length} capítulos ({allBlocks.length} bloques) añadidos al editor
                        </div>
                    </div>
                </div>,
                {
                    duration: 5000,
                    style: {
                        background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                        color: 'white',
                        padding: '16px',
                        borderRadius: '12px',
                        fontWeight: 500
                    }
                }
            );

            setShowReviewPanel(false);
            setGeneratedChapters([]);

            setTimeout(() => {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            }, 300);

        } catch (error: unknown) {
            console.error('❌ Error de importación:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            toast.dismiss(loadingToast);
            toast.error('Error al importar capítulos: ' + errorMessage);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                useEditorStore.getState().addBlock('text');
                toast.success('Nuevo párrafo añadido');
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                useEditorStore.getState().addBlock('heading', { properties: { level: 2 } });
                toast.success('H2 añadido');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);


    const insertEbookSection = (sectionType: EbookSectionType) => {
        const projectData = {
            title: project?.title || '[Título del eBook]',
            subtitle: '',
            author: '[Tu Nombre]'
        };

        const sectionBlocks = EBOOK_SECTION_TEMPLATES[sectionType](projectData);
        addBlocks(sectionBlocks);

        toast.success(`✅ Sección añadida`, {
            description: `Se ha añadido la plantilla de ${sectionType}`
        });

        setTimeout(() => {
            const firstBlock = document.querySelector(`[data-block-id="${sectionBlocks[0].id}"]`);
            if (firstBlock) {
                firstBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, 100);
    };

    const regenerateTableOfContents = () => {
        const chapters = blocks
            .filter(b => b.type === 'heading' && b.properties?.level === 1)
            .map((chapter) => ({
                title: chapter.content.replace(/<[^>]*>?/gm, ''), // Strip HTML if any
            }));

        const tocBlock = blocks.find(b => b.type === 'table-of-contents' || (b.type === 'text' && b.properties?.isTOC));

        if (!tocBlock) {
            toast.error("No se encontró una Tabla de Contenidos. Añádela primero desde eBook Structure.");
            return;
        }

        const newContent = chapters.map((ch, idx) =>
            `<p><strong>Capítulo ${idx + 1}:</strong> ${ch.title} ........................ [Página]</p>`
        ).join('');

        const updatedContent = `
            <p><strong>Prólogo</strong> ......................................................... [Página]</p>
            ${newContent}
            <p><strong>Conclusión</strong> ...................................................... [Página]</p>
            <p><strong>Sobre el Autor</strong> ................................................. [Página]</p>
            <p><strong>Referencias</strong> ..................................................... [Página]</p>
            <hr />
            <p>💡 <strong>Tip:</strong> Esta tabla se generó automáticamente. Puedes volver a sincronizarla si haces cambios en tus capítulos.</p>
        `;

        updateBlock(tocBlock.id, { content: updatedContent, properties: { ...tocBlock.properties, isTOC: true } });
        toast.success("Tabla de Contenidos sincronizada exitosamente ✨");
    };

    const exportToPDF = async () => {
        const loadingToast = toast.loading("Preparando exportación a PDF... Esto puede tardar unos segundos.");
        setIsExporting(true);

        try {
            const container = document.getElementById('ebook-canvas');
            if (!container) throw new Error("No se encontró el lienzo del editor");

            // Encontrar todas las páginas individuales renderizadas en el PrintLayoutView
            const pagesGroups = Array.from(container.querySelectorAll('.print-page'));

            if (pagesGroups.length === 0) {
                // Fallback si no está en modo Print Layout o si no hay páginas detectadas
                toast.error("Por favor, entra en modo 'Print Layout' para exportar con footers.");
                setIsExporting(false);
                toast.dismiss(loadingToast);
                return;
            }

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: false // Deshabilitamos compresión interna lenta, ya usamos JPEG
            });

            for (let i = 0; i < pagesGroups.length; i++) {
                const pageElement = pagesGroups[i] as HTMLElement;

                // Capturamos cada página individualmente con limpieza de UI
                const canvas = await html2canvas(pageElement, {
                    scale: 1.5, // 1.5 para mejor calidad ahora que optimizamos el resto
                    useCORS: true,
                    logging: false,
                    windowWidth: 794,
                    windowHeight: 1123,
                    removeContainer: true,
                    onclone: (documentClone) => {
                        // 1. ELIMINAR ELEMENTOS DE UI (No queremos que salgan en el libro)
                        const noExport = documentClone.querySelectorAll('.no-export, .page-break-indicator');
                        noExport.forEach(el => (el as HTMLElement).style.display = 'none');

                        // 2. APLICAR ESTILOS DE IMPRESIÓN PROFESIONAL AL CLON
                        const container = documentClone.querySelector('.export-container');
                        if (container) {
                            const style = document.createElement('style');
                            style.innerHTML = `
                                .export-container { 
                                    font-family: 'Georgia', serif !important; 
                                    line-height: 1.6 !important;
                                    color: #1a1a1a !important;
                                }
                                .export-container p { text-align: justify !important; margin-bottom: 1em !important; }
                                .export-container h1, .export-container h2 { color: #000 !important; font-family: 'Helvetica', sans-serif !important; }
                                
                                /* Mejorar Tablas en el PDF */
                                table { border-collapse: collapse !important; width: 100% !important; margin: 15px 0 !important; }
                                th { background-color: #f8fafc !important; border: 1px solid #e2e8f0 !important; padding: 8px !important; text-align: left !important; }
                                td { border: 1px solid #e2e8f0 !important; padding: 8px !important; }
                            `;
                            container.appendChild(style);
                        }
                    }
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.85);

                if (i > 0) pdf.addPage();

                // 'NONE' porque la imagen ya viene comprimida en JPEG desde toDataURL
                pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'NONE');

                // Actualizar toast con progreso
                toast.loading(`Procesando página ${i + 1} de ${pagesGroups.length}...`, { id: loadingToast });

                // Pequeña pausa para dejar que el navegador respire y actualice el UI
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            pdf.save(`${project?.title || 'ebook'}.pdf`);
            toast.dismiss(loadingToast);
            toast.success("✅ PDF exportado con éxito");
        } catch (error: unknown) {
            console.error('Export error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            toast.dismiss(loadingToast);
            toast.error("Error al exportar: " + errorMessage);
        } finally {
            setIsExporting(false);
        }
    };

    const exportToDOCX = async () => {
        const loadingToast = toast.loading("Generando documento Word... Esto puede tardar unos segundos.");
        setIsExporting(true);

        try {
            await exportToWord(blocks, {
                title: project?.title || 'Untitled eBook',
                author: 'Autor',
                subject: 'eBook'
            });
            toast.dismiss(loadingToast);
            toast.success("✅ Documento Word (.docx) descargado con éxito");
        } catch (error: unknown) {
            console.error('Word export error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            toast.dismiss(loadingToast);
            toast.error("Error al exportar a Word: " + errorMessage);
        } finally {
            setIsExporting(false);
        }
    };

    const exportToEPUB = async () => {
        const loadingToast = toast.loading("Generando archivo ePub compatible con Kindle...");
        setIsExporting(true);

        try {
            // 1. Preparar capítulos basados en la estructura del editor
            const chapters = blocksToChapters(blocks);

            if (chapters.length === 0) {
                throw new Error("No se detectaron capítulos. Asegúrate de usar títulos (H1) para separar el contenido.");
            }

            // 2. Ejecutar exportación
            await exportToEpub(chapters, {
                title: project?.title || 'Untitled eBook',
                author: 'Autor',
                description: project?.content.generationParams?.topic || 'eBook generado con eBook Creator',
                language: 'es',
                published: new Date().toISOString()
            });

            toast.dismiss(loadingToast);
            toast.success(`✅ ePub generado con ${chapters.length} capítulos`);
        } catch (error: unknown) {
            console.error('ePub export error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            toast.dismiss(loadingToast);
            toast.error("Error al exportar a ePub: " + errorMessage);
        } finally {
            setIsExporting(false);
        }
    };

    const StructureButton = ({ icon, label, onClick, tooltip }: { icon: React.ReactNode, label: string, onClick: () => void, tooltip: string }) => (
        <div
            className="p-2 border rounded bg-background text-xs cursor-pointer hover:border-primary transition-colors flex items-center gap-2 group relative"
            onClick={onClick}
            title={tooltip}
        >
            {icon}
            <span className="truncate">{label}</span>
        </div>
    );

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading editor...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col bg-background">
            <header className="h-14 border-b flex items-center justify-between px-4 bg-background z-10">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <div className="h-4 w-[1px] bg-border" />
                    <h1 className="font-semibold text-sm truncate max-w-[200px]">
                        {project?.title || 'Untitled Project'}
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden lg:flex items-center gap-4 mr-4 px-3 py-1 bg-muted/30 rounded-full border border-border/50">
                        <div className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[11px] font-bold text-muted-foreground mr-1 uppercase tracking-tight">Words:</span>
                            <span className="text-xs font-black tabular-nums">{wordCount.toLocaleString()}</span>
                        </div>
                        <div className="w-[1px] h-3 bg-border" />
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[11px] font-bold text-muted-foreground mr-1 uppercase tracking-tight">Est. Pages:</span>
                            <span className="text-xs font-black tabular-nums">{estimatedPages}</span>
                        </div>
                    </div>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setViewMode(viewMode === 'print' ? 'normal' : 'print')}
                        className="gap-2"
                    >
                        {viewMode === 'print' ? (
                            <>
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span>Normal View</span>
                            </>
                        ) : (
                            <>
                                <BookOpen className="h-4 w-4 text-emerald-600" />
                                <span>Print Layout</span>
                            </>
                        )}
                    </Button>

                    <Button
                        variant={isPreviewMode ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setMode(isPreviewMode ? 'edit' : 'preview')}
                        className={cn("gap-2", isPreviewMode && "bg-blue-600 hover:bg-blue-700")}
                    >
                        {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {isPreviewMode ? 'Exit Preview' : 'Preview'}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-2 border-blue-200" disabled={isExporting}>
                                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 text-blue-600" />}
                                {isExporting ? 'Exporting...' : 'Export'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-2">
                            <DropdownMenuLabel className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Formatos de Publicación</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={exportToPDF} className="gap-3 py-2.5 cursor-pointer">
                                <div className="p-1.5 bg-red-100 text-red-600 rounded-md">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Adobe PDF (.pdf)</span>
                                    <span className="text-[10px] text-muted-foreground">Ideal para Amazon KDP Print</span>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={exportToEPUB} className="gap-3 py-2.5 cursor-pointer">
                                <div className="p-1.5 bg-yellow-100 text-yellow-600 rounded-md">
                                    <Book className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">ePub (Kindle)</span>
                                    <span className="text-[10px] text-muted-foreground">Ideal para Amazon Store</span>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={exportToDOCX} className="gap-3 py-2.5 cursor-pointer">
                                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Word Document (.docx)</span>
                                    <span className="text-[10px] text-muted-foreground">Editable y profesional</span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-6 w-[1px] bg-border mx-1" />

                    <Button size="sm" onClick={() => save()} className="bg-slate-900 text-white hover:bg-slate-800">
                        <Save className="mr-2 h-4 w-4" />
                        Save
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {!isPreviewMode && (
                    <aside className="w-64 border-r bg-muted/10 hidden md:flex flex-col p-4 overflow-y-auto">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                            Components
                        </p>
                        <div className="space-y-2">
                            <div
                                className="p-3 border rounded bg-background text-sm cursor-pointer hover:border-primary transition-colors flex items-center gap-2"
                                onClick={() => addBlock('text')}
                            >
                                Text Block
                            </div>
                            <div
                                className="p-3 border rounded bg-background text-sm cursor-pointer hover:border-primary transition-colors flex items-center gap-2"
                                onClick={() => addBlock('heading')}
                            >
                                Heading
                            </div>
                            <div
                                className="p-3 border rounded bg-background text-sm cursor-pointer hover:border-primary transition-colors flex items-center gap-2"
                                onClick={() => addBlock('image')}
                            >
                                Image
                            </div>
                            <div
                                className="p-3 border rounded bg-background text-sm cursor-pointer hover:border-primary transition-colors flex items-center gap-2"
                                onClick={() => addBlock('divider')}
                            >
                                Divider
                            </div>
                            <div
                                className="p-3 border rounded bg-background text-sm cursor-pointer hover:border-primary transition-colors flex items-center gap-2"
                                onClick={() => addBlock('page-break')}
                            >
                                Page Break
                            </div>
                        </div>

                        <div className="mt-8 border-t pt-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Book className="h-3 w-3" />
                                eBook Structure
                            </p>
                            <div className="space-y-1">
                                <StructureButton
                                    icon={<Book className="h-4 w-4 text-blue-500" />}
                                    label="Cover Page"
                                    onClick={() => insertEbookSection('cover')}
                                    tooltip="Portada profesional con título, subtítulo y autor."
                                />
                                <StructureButton
                                    icon={<Copyright className="h-4 w-4 text-slate-500" />}
                                    label="Copyright Page"
                                    onClick={() => insertEbookSection('copyright')}
                                    tooltip="Página legal requerida para proteger tus derechos de autor."
                                />
                                <StructureButton
                                    icon={<List className="h-4 w-4 text-emerald-500" />}
                                    label="Table of Contents"
                                    onClick={() => insertEbookSection('toc')}
                                    tooltip="Esquema navegable del contenido de tu eBook."
                                />
                                <StructureButton
                                    icon={<Heart className="h-4 w-4 text-red-500" />}
                                    label="Dedication"
                                    onClick={() => insertEbookSection('dedication')}
                                    tooltip="Espacio para dedicar tu obra a alguien especial."
                                />
                                <StructureButton
                                    icon={<MessageSquare className="h-4 w-4 text-purple-500" />}
                                    label="Prologue"
                                    onClick={() => insertEbookSection('prologue')}
                                    tooltip="Introducción gancho para conectar con el lector."
                                />
                                <StructureButton
                                    icon={<User className="h-4 w-4 text-orange-500" />}
                                    label="About the Author"
                                    onClick={() => insertEbookSection('about-author')}
                                    tooltip="Tu biografía y enlaces para que te sigan."
                                />
                                <StructureButton
                                    icon={<Library className="h-4 w-4 text-indigo-500" />}
                                    label="References"
                                    onClick={() => insertEbookSection('references')}
                                    tooltip="Lista de fuentes y bibliografía consultada."
                                />
                                <StructureButton
                                    icon={<Target className="h-4 w-4 text-rose-500" />}
                                    label="Call to Action"
                                    onClick={() => insertEbookSection('cta')}
                                    tooltip="Página final para pedir reseñas o vender otros servicios."
                                />
                                {blocks.some(b => b.properties?.isTOC) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-2 text-[10px] h-8 gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all border-dashed"
                                        onClick={regenerateTableOfContents}
                                    >
                                        <RefreshCw className="h-3 w-3 animate-spin-slow" />
                                        Sync TOC
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 border-t pt-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                                AI Tools
                            </p>
                            <div className="relative space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2 border-slate-200 hover:bg-slate-50 transition-colors"
                                    onClick={() => setShowPromptModal(true)}
                                >
                                    <span className="text-lg">📚</span>
                                    <div className="flex flex-col items-start leading-tight">
                                        <span className="text-xs font-bold">Generate NotebookLM Brief</span>
                                        <span className="text-[10px] opacity-70 font-normal">Create research prompt</span>
                                    </div>
                                </Button>

                                <Button
                                    className="w-full justify-start gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 transition-opacity"
                                    onClick={() => setShowBulkModal(true)}
                                >
                                    <span className="text-lg">📊</span>
                                    <div className="flex flex-col items-start leading-tight">
                                        <span className="text-xs font-bold">Generate Full eBook</span>
                                        <span className="text-[10px] opacity-90 font-normal">From NotebookLM</span>
                                    </div>
                                </Button>

                                {showOnboarding && (
                                    <div className="absolute left-full ml-4 top-0 w-48 bg-purple-600 text-white p-3 rounded-xl shadow-2xl z-50 animate-in slide-in-from-left-2 fade-in duration-500">
                                        <div className="absolute right-full top-4 translate-x-[2px] w-0 h-0 border-y-[8px] border-y-transparent border-r-[8px] border-r-purple-600" />
                                        <p className="text-[10px] font-bold mb-1">👋 Welcome!</p>
                                        <p className="text-[10px] leading-tight opacity-90 mb-2">Generate a complete eBook from your analysis in seconds!</p>
                                        <Button size="sm" variant="secondary" className="h-6 text-[9px] w-full" onClick={(e) => { e.stopPropagation(); dismissOnboarding(); }}>Got it</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                )}

                <main className={cn(
                    "flex-1 relative flex flex-col overflow-y-auto transition-all",
                    isPreviewMode && "max-w-4xl mx-auto py-12 px-4 shadow-2xl bg-white dark:bg-slate-950 my-12 rounded-lg border-x"
                )}>
                    {blocks.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full animate-pulse" />
                                <div className="relative text-8xl drop-shadow-2xl">📝</div>
                            </div>
                            <h2 className="text-4xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                                Tu lienzo está listo
                            </h2>
                            <p className="text-muted-foreground max-w-md mb-10 text-lg font-medium leading-relaxed">
                                Comienza añadiendo bloques manualmente para darle forma a tu idea o deja que la IA genere un eBook completo por ti.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    size="lg"
                                    className="h-14 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 shadow-2xl shadow-blue-200 text-white font-bold text-lg rounded-2xl transition-all hover:scale-105 active:scale-95"
                                    onClick={() => setShowBulkModal(true)}
                                >
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Generar con IA
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-14 px-8 border-2 font-bold text-lg rounded-2xl hover:bg-muted/50 transition-all active:scale-95"
                                    onClick={() => addBlock('heading', { content: 'Capítulo 1', properties: { level: 1 } })}
                                >
                                    ➕ Añadir Bloque
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            id="ebook-canvas"
                            className={cn(
                                "flex-1 flex flex-col",
                                isPreviewMode && "max-w-4xl mx-auto py-12 px-4 shadow-2xl bg-white dark:bg-slate-950 my-12 rounded-lg border-x"
                            )}
                        >
                            <Canvas />
                        </div>
                    )}
                </main>

                {!isPreviewMode && (
                    <PropertySidebar />
                )}
            </div>

            <BulkGenerateModal
                isOpen={showBulkModal}
                onClose={() => setShowBulkModal(false)}
                onGenerate={handleBulkGenerate}
                ebookTitle={project?.title || ''}
            />

            {showReviewPanel && (
                <ChapterReviewPanel
                    chapters={generatedChapters}
                    ebookTitle={project?.title || ''}
                    onApprove={handleApproveChapter}
                    onReject={handleRejectChapter}
                    onRegenerate={handleRegenerateChapter}
                    onEdit={handleEditChapter}
                    onFinish={handleFinishReview}
                    onClose={() => setShowReviewPanel(false)}
                />
            )}

            {isGenerating && (
                <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-[100] animate-in fade-in duration-300">
                    <div className="bg-background rounded-3xl p-10 max-w-md w-full shadow-2xl space-y-8 text-center border-2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                            <div className="relative bg-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-200">
                                <Sparkles className="h-10 w-10 text-white animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-black tracking-tight">Generating Your eBook</h3>
                            <p className="text-muted-foreground font-medium">
                                Converting your analysis into professional content...
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-in-out"
                                    style={{ width: '40%' }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                                <span>Generating content...</span>
                                {estimatedTimeRemaining !== null && (
                                    <span>~{Math.floor(estimatedTimeRemaining / 60)}:{(estimatedTimeRemaining % 60).toString().padStart(2, '0')} remaining</span>
                                )}
                            </div>
                        </div>

                        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-orange-800 text-xs font-bold">
                            ⚠️ Por favor no cierres esta ventana. La generación secuencial está en curso para asegurar la mejor calidad.
                        </div>
                    </div>
                </div>
            )}
            {showCelebration && (
                <div className="fixed inset-0 pointer-events-none z-[200] flex items-center justify-center overflow-hidden">
                    <div className="text-9xl animate-bounce drop-shadow-2xl">🎉</div>
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-blue-500/10 animate-pulse" />
                </div>
            )}
            <NotebookLMPromptModal
                isOpen={showPromptModal}
                onClose={() => setShowPromptModal(false)}
                project={project}
            />
        </div>
    )
}
