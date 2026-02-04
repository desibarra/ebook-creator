
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Loader2, Zap, BookOpen, AlertTriangle } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { toast } from 'sonner';

interface BulkGenerateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (analysis: string, options: GenerationOptions) => Promise<void>;
    ebookTitle: string;
}

export interface GenerationOptions {
    autoApprove: boolean;
    generateTables: boolean;
    generateCases: boolean;
    wordCount: 'short' | 'medium' | 'long';
}

export default function BulkGenerateModal({
    isOpen,
    onClose,
    onGenerate,
    ebookTitle
}: BulkGenerateModalProps) {
    const [analysis, setAnalysis] = useState('');
    const [options, setOptions] = useState<GenerationOptions>({
        autoApprove: false,
        generateTables: true,
        generateCases: true,
        wordCount: 'medium'
    });
    const [isGenerating, setIsGenerating] = useState(false);

    const charCount = analysis.length;
    // Improved regex to detect chapters 
    const estimatedChapters = (analysis.match(/^(?:Capítulo|Chapter|Tema|Part)\s*\d+[:.]/gim) || []).length;

    const handleGenerate = async () => {
        if (charCount < 500) {
            toast.error("Por favor pega al menos 500 caracteres del análisis.");
            return;
        }
        if (estimatedChapters === 0) {
            toast.error("No se detectaron capítulos. Asegúrate de incluir la estructura 'Capítulo 1: ...'");
            return;
        }

        setIsGenerating(true);
        try {
            await onGenerate(analysis, options);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    // Estimates
    const wordsPerChapter = options.wordCount === 'short' ? 600 : options.wordCount === 'medium' ? 800 : 1050;
    const totalWords = estimatedChapters * wordsPerChapter;
    const estimatedTime = Math.ceil(estimatedChapters * 0.5);
    const estimatedCost = (estimatedChapters * 0.20).toFixed(2);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isGenerating && onClose()}>
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0 border-none rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-purple-700 to-blue-700 p-8 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black flex items-center gap-3">
                            <span className="bg-white/20 p-2 rounded-xl backdrop-blur-md italic">📊</span>
                            Generate Full eBook from NotebookLM
                        </DialogTitle>
                        <DialogDescription className="text-white/80 text-lg max-w-2xl">
                            Paste your complete NotebookLM analysis below. Our AI will transform it into a fully formatted book in minutes.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-8 bg-background">
                    {/* Main Textarea */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">NotebookLM Analysis Output</Label>
                            <div className="flex items-center gap-2">
                                {estimatedChapters > 0 && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold animate-in zoom-in duration-300">
                                        <BookOpen className="h-3.5 w-3.5" /> {estimatedChapters} chapters detected
                                    </span>
                                )}
                            </div>
                        </div>
                        <Textarea
                            value={analysis}
                            onChange={(e) => setAnalysis(e.target.value)}
                            placeholder={`Paste your complete NotebookLM response here.
It should include text like:
Capítulo 1: Introducción...
Concepto: ...
DATOS: ...

Capítulo 2: ...`}
                            className="min-h-[384px] font-mono text-sm p-6 bg-muted/30 border-2 rounded-2xl focus-visible:ring-blue-500 transition-all resize-none shadow-inner"
                        />
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-muted-foreground px-1">
                            <span>{charCount.toLocaleString()} / 50,000 characters</span>
                            {charCount > 0 && charCount < 500 && <span className="text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Min 500 chars needed</span>}
                        </div>
                    </div>

                    {/* Options & Estimates Box */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Options */}
                        <div className="lg:col-span-3 bg-muted/20 p-6 rounded-2xl border-2 space-y-6">
                            <h3 className="font-black text-sm uppercase tracking-widest">Generation Options</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase">Chapter Length</Label>
                                    <Select
                                        value={options.wordCount}
                                        onValueChange={(val: any) => setOptions({ ...options, wordCount: val })}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl font-bold bg-background">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="short" className="font-medium">Short (500-700 words)</SelectItem>
                                            <SelectItem value="medium" className="font-medium">Medium (700-900 words)</SelectItem>
                                            <SelectItem value="long" className="font-medium">Long (900-1200 words)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center space-x-3 group">
                                        <Checkbox
                                            id="tables"
                                            checked={options.generateTables}
                                            onCheckedChange={(checked) => setOptions({ ...options, generateTables: checked as boolean })}
                                            className="w-5 h-5 rounded-md"
                                        />
                                        <Label htmlFor="tables" className="cursor-pointer font-bold text-sm">Generate tables automatically</Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="cases"
                                            checked={options.generateCases}
                                            onCheckedChange={(checked) => setOptions({ ...options, generateCases: checked as boolean })}
                                            className="w-5 h-5 rounded-md"
                                        />
                                        <Label htmlFor="cases" className="cursor-pointer font-bold text-sm">Generate case studies</Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="autoApprove"
                                            checked={options.autoApprove}
                                            onCheckedChange={(checked) => setOptions({ ...options, autoApprove: checked as boolean })}
                                            className="w-5 h-5 rounded-md border-orange-200"
                                        />
                                        <Label htmlFor="autoApprove" className="cursor-pointer text-orange-600 font-black text-xs uppercase italic drop-shadow-sm">
                                            Auto-approve all (skip review) ⚠️
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Estimates */}
                        <div className="lg:col-span-2 bg-blue-50/50 p-6 rounded-2xl border-2 border-blue-100 flex flex-col justify-center">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-blue-600 p-2.5 rounded-xl">
                                    <Zap className="h-6 w-6 text-white fill-white" />
                                </div>
                                <h3 className="font-black text-blue-900 uppercase tracking-widest text-xs">Estimated Impact</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-white/50 p-3 rounded-lg">
                                    <span className="text-xs font-bold text-blue-800/70">Time to generate:</span>
                                    <span className="font-black text-blue-900 underline decoration-blue-300 decoration-2">~{estimatedTime} minutes</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/50 p-3 rounded-lg">
                                    <span className="text-xs font-bold text-blue-800/70">Estimated Cost:</span>
                                    <span className="font-black text-blue-900 underline decoration-blue-300 decoration-2">~${estimatedCost} USD</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/50 p-3 rounded-lg">
                                    <span className="text-xs font-bold text-blue-800/70">Total Words:</span>
                                    <span className="font-black text-blue-900 underline decoration-blue-300 decoration-2">~{totalWords.toLocaleString()} words</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-8 bg-muted/10 border-t flex flex-col sm:flex-row gap-4 sm:gap-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isGenerating}
                        className="h-14 px-8 font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={charCount < 500 || estimatedChapters === 0 || isGenerating}
                        className="h-14 flex-1 sm:flex-none px-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black text-lg shadow-xl shadow-blue-200 hover:scale-[1.02] transition-transform active:scale-95 disabled:scale-100"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing Analysis...
                            </>
                        ) : (
                            <>
                                <span className="mr-2">🚀</span>
                                Generate Full eBook
                                {estimatedChapters > 0 && ` (${estimatedChapters} Chapters)`}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
