
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';
import {
    CheckCircle2,
    Circle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Eye,
    Edit3,
    RotateCcw,
    X,
    Check,
    Save,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export interface Chapter {
    id: string;
    number: number;
    title: string;
    content: string;
    status: 'draft' | 'approved' | 'rejected';
    order: number;
    wordCount?: number;
    blocks?: any[]; // For insertion into editor
}

interface ChapterReviewPanelProps {
    chapters: Chapter[];
    ebookTitle: string;
    onApprove: (chapterId: string) => Promise<void>;
    onReject: (chapterId: string) => Promise<void>;
    onRegenerate: (chapterId: string) => Promise<void>;
    onEdit: (chapterId: string, newContent: string) => Promise<void>;
    onFinish: (approvedChapters: Chapter[]) => void;
    onClose: () => void;
}

export default function ChapterReviewPanel({
    chapters: initialChapters,
    ebookTitle,
    onApprove,
    onReject,
    onRegenerate,
    onEdit,
    onFinish,
    onClose
}: ChapterReviewPanelProps) {
    const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
    const [isSaving, setIsSaving] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [isLoadingChapters, setIsLoadingChapters] = useState(true);

    // Simulate initial professional loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoadingChapters(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const currentChapter = chapters[selectedIdx];
    const approvedCount = chapters.filter(c => c.status === 'approved').length;
    const progress = (approvedCount / chapters.length) * 100;

    useEffect(() => {
        if (currentChapter) {
            setEditContent(currentChapter.content);
        }
    }, [currentChapter]);

    const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
        try {
            if (status === 'approved') await onApprove(id);
            if (status === 'rejected') await onReject(id);

            setChapters(prev => prev.map(c => c.id === id ? { ...c, status } : c));

            // Move to next draft if available
            const nextIdx = chapters.findIndex((c, i) => i > selectedIdx && c.status === 'draft');
            if (nextIdx !== -1) {
                setSelectedIdx(nextIdx);
            } else {
                // Check from beginning
                const firstDraft = chapters.findIndex(c => c.status === 'draft');
                if (firstDraft !== -1) setSelectedIdx(firstDraft);
            }
        } catch (e) {
            toast.error("Error updating status");
        }
    };

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            await onEdit(currentChapter.id, editContent);
            setChapters(prev => prev.map(c => c.id === currentChapter.id ? { ...c, content: editContent } : c));
            toast.success("Capítulo guardado");
        } catch (e) {
            toast.error("Error al guardar");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRegenerateClick = async () => {
        try {
            await onRegenerate(currentChapter.id);
            toast.info("Solicitud de regeneración enviada");
        } catch (e) {
            toast.error("Error al regenerar");
        }
    }

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in fade-in duration-300">
            {/* Top Bar */}
            <div className="h-16 border-b flex items-center justify-between px-6 bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={onClose} className="gap-2" aria-label="Volver al editor">
                        <ChevronLeft className="h-4 w-4" /> Back to Editor
                    </Button>
                    <div className="h-4 w-[1px] bg-border" />
                    <h1 className="font-bold truncate max-w-[300px]">{ebookTitle}</h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end gap-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            Progress: {approvedCount}/{chapters.length} approved
                        </div>
                        <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 shadow-lg shadow-green-200 disabled:opacity-50"
                        disabled={approvedCount === 0}
                        onClick={() => onFinish(chapters.filter(c => c.status === 'approved'))}
                    >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Finish & Import ({approvedCount})
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {isLoadingChapters ? (
                    <div className="flex-1 flex">
                        {/* Sidebar Skeleton */}
                        <aside className="w-80 border-r bg-muted/20 flex flex-col p-4 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="p-4 rounded-xl border-2 border-transparent bg-background/50 animate-pulse space-y-2">
                                    <div className="h-2 w-16 bg-muted rounded" />
                                    <div className="h-4 w-full bg-muted rounded" />
                                </div>
                            ))}
                        </aside>
                        {/* Content Skeleton */}
                        <main className="flex-1 flex flex-col bg-background p-20 space-y-6">
                            <div className="max-w-4xl mx-auto w-full animate-pulse space-y-8">
                                <div className="space-y-3">
                                    <div className="h-10 w-2/3 bg-muted rounded-lg" />
                                    <div className="h-4 w-1/4 bg-muted rounded" />
                                </div>
                                <div className="space-y-4 pt-10">
                                    <div className="h-4 w-full bg-muted rounded" />
                                    <div className="h-4 w-full bg-muted rounded" />
                                    <div className="h-4 w-5/6 bg-muted rounded" />
                                    <div className="h-4 w-full bg-muted rounded" />
                                    <div className="h-4 w-4/5 bg-muted rounded" />
                                </div>
                            </div>
                        </main>
                    </div>
                ) : (
                    <>
                        {/* Sidebar */}
                        <aside className="w-80 border-r bg-muted/20 flex flex-col">
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-2">
                                    {chapters.map((ch, idx) => (
                                        <ChapterItem
                                            key={ch.id || `chapter-${idx}`}
                                            ch={ch}
                                            isSelected={selectedIdx === idx}
                                            onClick={() => setSelectedIdx(idx)}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                        </aside>

                        {/* Content */}
                        <main className="flex-1 flex flex-col bg-background overflow-hidden">
                            {/* Chapter Header */}
                            <div className="p-8 border-b bg-background flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black tracking-tight">{currentChapter.title}</h2>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                                        <span className="flex items-center gap-1">
                                            {currentChapter.content.split(/\s+/).length} words
                                        </span>
                                        <span>•</span>
                                        <span className="capitalize">{currentChapter.status}</span>
                                    </div>
                                </div>

                                <div className="flex bg-muted p-1 rounded-lg">
                                    <button
                                        onClick={() => setViewMode('preview')}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-bold",
                                            viewMode === 'preview' ? "bg-background shadow-sm text-blue-600" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Eye className="h-4 w-4" /> Preview
                                    </button>
                                    <button
                                        onClick={() => setViewMode('edit')}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-bold",
                                            viewMode === 'edit' ? "bg-background shadow-sm text-blue-600" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Edit3 className="h-4 w-4" /> Edit
                                    </button>
                                </div>
                            </div>

                            {/* Editor/Preview Area */}
                            <ScrollArea className="flex-1 p-12 lg:p-20">
                                <div className="max-w-4xl mx-auto mb-32">
                                    {viewMode === 'preview' ? (
                                        <div className="prose prose-blue prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-p:leading-relaxed prose-li:my-2 prose-headings:tracking-tight">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {currentChapter.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <Textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="min-h-[600px] text-lg font-mono leading-relaxed p-8 focus-visible:ring-blue-500 border-2 bg-muted/5 rounded-2xl"
                                                placeholder="Start writing..."
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" onClick={() => setViewMode('preview')}>Cancel</Button>
                                                <Button onClick={handleSaveEdit} disabled={isSaving} className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100">
                                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                    Save Changes
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Footer Actions */}
                            <div className="h-24 border-t bg-background flex items-center justify-between px-10 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" size="lg" className="h-14 px-6 gap-2 font-bold hover:bg-muted/50 transition-colors" onClick={handleRegenerateClick}>
                                        <RotateCcw className="h-5 w-5" /> Regenerate
                                    </Button>
                                    <Button variant="outline" size="lg" className="h-14 px-6 gap-2 font-bold hover:bg-muted/50 transition-colors" onClick={() => setViewMode('edit')}>
                                        <Edit3 className="h-5 w-5" /> Manual Edit
                                    </Button>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="destructive"
                                        size="lg"
                                        className="h-14 px-10 font-bold tracking-tight opacity-80 hover:opacity-100 transition-opacity"
                                        onClick={() => handleStatusUpdate(currentChapter.id, 'rejected')}
                                    >
                                        <XCircle className="mr-2 h-6 w-6" /> REJECT
                                    </Button>
                                    <Button
                                        size="lg"
                                        className="h-14 px-14 font-black tracking-tight bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-100 active:scale-95 transition-all"
                                        onClick={() => handleStatusUpdate(currentChapter.id, 'approved')}
                                    >
                                        <CheckCircle2 className="mr-2 h-6 w-6" /> APPROVE & NEXT
                                    </Button>
                                </div>
                            </div>
                        </main>
                    </>
                )}
            </div>
        </div>
    );
}

const ChapterItem = ({
    ch,
    isSelected,
    onClick
}: {
    ch: Chapter;
    isSelected: boolean;
    onClick: () => void;
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "p-4 rounded-xl border-2 transition-all cursor-pointer group relative",
                isSelected
                    ? "bg-background border-blue-500 shadow-md ring-2 ring-blue-500/10"
                    : "bg-background/50 border-transparent hover:border-muted-foreground/20 hover:bg-background"
            )}
            role="button"
            aria-selected={isSelected}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
        >
            <div className="flex items-center justify-between mb-2">
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-tighter",
                    isSelected ? "text-blue-600" : "text-muted-foreground"
                )}>
                    Chapter {ch.number}
                </span>
                <StatusBadge status={ch.status} />
            </div>
            <h3 className={cn(
                "text-sm font-bold leading-tight line-clamp-2",
                isSelected ? "text-foreground" : "text-foreground/70"
            )}>
                {ch.title}
            </h3>
            {isSelected && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
            )}
        </div>
    );
};

function StatusBadge({ status }: { status: 'draft' | 'approved' | 'rejected' }) {
    const config = {
        draft: { icon: Circle, color: "text-gray-400 bg-gray-100", label: "Draft" },
        approved: { icon: CheckCircle2, color: "text-green-600 bg-green-50", label: "Approved" },
        rejected: { icon: XCircle, color: "text-red-500 bg-red-50", label: "Rejected" }
    }[status];

    const Icon = config.icon;

    return (
        <span className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border",
            config.color,
            status === 'draft' ? "border-gray-200" : status === 'approved' ? "border-green-100" : "border-red-100"
        )}>
            <Icon className="h-3 w-3" />
            {config.label}
        </span>
    );
}
