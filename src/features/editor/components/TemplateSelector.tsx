
import { useState } from 'react';
import { EBOOK_TEMPLATES, EbookTemplate, generateNotebookLMPrompt, generateResearchPrompt } from '@/lib/templates/ebook-templates';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { cn } from '@/shared/lib/utils';
import { Check, Clipboard, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateSelectorProps {
    onComplete: (prompt: string, config: any, templateData: any) => void;
}

export default function TemplateSelector({ onComplete }: TemplateSelectorProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedTemplate, setSelectedTemplate] = useState<EbookTemplate | null>(null);
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [activePromptTab, setActivePromptTab] = useState<'research' | 'analysis'>('research');
    const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

    const handleSelectTemplate = (template: EbookTemplate) => {
        setSelectedTemplate(template);
        // Initialize form values with defaults if any
        const initialValues: Record<string, string> = {};
        template.fields.forEach(field => {
            if (field.type === 'number') initialValues[field.id] = field.placeholder || '12';
        });
        setFormValues(initialValues);
        setStep(2);
    };

    const handleInputChange = (fieldId: string, value: string) => {
        setFormValues(prev => ({ ...prev, [fieldId]: value }));
    };

    const isFormValid = () => {
        if (!selectedTemplate) return false;
        return selectedTemplate.fields.every(field => {
            if (field.required) {
                return formValues[field.id] && formValues[field.id].trim().length > 0;
            }
            return true;
        });
    };

    const handleGeneratePrompt = () => {
        if (!selectedTemplate) return;
        setStep(3);
    };

    const handleCopyPrompt = async (prompt: string, type: string) => {
        await navigator.clipboard.writeText(prompt);
        setCopiedPrompt(type);
        toast.success(`${type === 'research' ? 'Research' : 'Analysis'} Prompt copied to clipboard!`);
        setTimeout(() => setCopiedPrompt(null), 2000);
    };

    // Derived prompts for Step 3
    const researchPrompt = selectedTemplate ? generateResearchPrompt(selectedTemplate.id, formValues) : '';
    const analysisPrompt = selectedTemplate ? generateNotebookLMPrompt(selectedTemplate.id, formValues) : '';

    return (
        <div className="w-full max-w-6xl mx-auto py-8 px-4">
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-12 gap-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                            step === s ? "bg-blue-600 text-white shadow-lg scale-110" :
                                step > s ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
                        )}>
                            {step > s ? <Check className="w-6 h-6" /> : s}
                        </div>
                        {s < 3 && <div className={cn("w-20 h-1 mx-2 rounded", step > s ? "bg-green-500" : "bg-gray-200")} />}
                    </div>
                ))}
            </div>

            {/* Step 1: Template Selection (No changes needed) */}
            {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-3xl font-bold text-center mb-8">Selecciona una Plantilla</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {EBOOK_TEMPLATES.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => handleSelectTemplate(template)}
                                className="group p-6 border-2 rounded-xl bg-background hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer flex flex-col gap-4 relative overflow-hidden"
                            >
                                <div className="text-4xl">{template.icon}</div>
                                <div>
                                    <h3 className="font-bold text-xl mb-1">{template.name}</h3>
                                    <p className="text-sm text-muted-foreground">{template.description}</p>
                                </div>
                                <div className="mt-auto">
                                    <span className="text-xs font-semibold px-2 py-1 bg-muted rounded-full uppercase tracking-wider">
                                        {template.category}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Form (No changes needed) */}
            {step === 2 && selectedTemplate && (
                <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
                    <Button variant="ghost" onClick={() => setStep(1)} className="mb-6">← Back to Templates</Button>
                    <div className="bg-background border-2 rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl">{selectedTemplate.icon}</span>
                            <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
                        </div>

                        <div className="space-y-6">
                            {selectedTemplate.fields.map((field) => (
                                <div key={field.id} className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                        {field.label}
                                        {field.required && <span className="text-red-500">*</span>}
                                    </Label>

                                    {field.type === 'text' && (
                                        <Input
                                            placeholder={field.placeholder}
                                            value={formValues[field.id] || ''}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        />
                                    )}

                                    {field.type === 'textarea' && (
                                        <div className="space-y-1">
                                            <Textarea
                                                placeholder={field.placeholder}
                                                className="min-h-[120px] resize-none"
                                                value={formValues[field.id] || ''}
                                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                            />
                                            <div className="text-right text-[10px] text-muted-foreground">
                                                {(formValues[field.id] || '').length} characters
                                            </div>
                                        </div>
                                    )}

                                    {field.type === 'select' && (
                                        <Select
                                            value={formValues[field.id] || ''}
                                            onValueChange={(val) => handleInputChange(field.id, val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una opción" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options?.map(opt => (
                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {field.type === 'number' && (
                                        <Input
                                            type="number"
                                            placeholder={field.placeholder}
                                            value={formValues[field.id] || ''}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        />
                                    )}

                                    {field.helperText && <p className="text-xs text-muted-foreground">{field.helperText}</p>}
                                </div>
                            ))}
                        </div>

                        <Button
                            className="w-full mt-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white h-12 text-lg font-bold shadow-lg hover:opacity-90 transition-opacity"
                            disabled={!isFormValid()}
                            onClick={handleGeneratePrompt}
                        >
                            <Sparkles className="mr-2 h-5 w-5" />
                            🎯 Generate NotebookLM Prompts
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Result (REDESIGNED) */}
            {step === 3 && selectedTemplate && (
                <div className="max-w-4xl mx-auto animate-in fade-in scale-in-95 duration-500 pb-12">
                    <div className="space-y-6">
                        {/* Header con explicación */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
                            <h2 className="text-2xl font-bold mb-2">✨ Your Prompts are Ready!</h2>
                            <p className="text-gray-700 dark:text-gray-300">
                                We've generated TWO prompts for you. Choose your workflow below:
                            </p>
                        </div>

                        {/* Workflow selector */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Opción A: Research First */}
                            <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${activePromptTab === 'research'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 hover:border-blue-300'
                                }`}
                                onClick={() => setActivePromptTab('research')}>
                                <div className="flex items-start gap-3">
                                    <span className="text-3xl">🔍</span>
                                    <div>
                                        <h3 className="font-bold text-lg mb-2">Research First</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            Start here if you <strong>don't have PDF sources yet</strong>
                                        </p>
                                        <div className="text-xs space-y-1 text-gray-500">
                                            <div>1️⃣ Copy Research Prompt</div>
                                            <div>2️⃣ NotebookLM suggests sources</div>
                                            <div>3️⃣ Download PDFs</div>
                                            <div>4️⃣ Continue with Analysis Prompt</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Opción B: Analysis Direct */}
                            <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${activePromptTab === 'analysis'
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-200 hover:border-purple-300'
                                }`}
                                onClick={() => setActivePromptTab('analysis')}>
                                <div className="flex items-start gap-3">
                                    <span className="text-3xl">📊</span>
                                    <div>
                                        <h3 className="font-bold text-lg mb-2">Skip to Analysis</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            Use this if you <strong>already have PDF sources</strong>
                                        </p>
                                        <div className="text-xs space-y-1 text-gray-500">
                                            <div>1️⃣ Upload PDFs to NotebookLM</div>
                                            <div>2️⃣ Copy Analysis Prompt</div>
                                            <div>3️⃣ Get structured analysis</div>
                                            <div>4️⃣ Generate your eBook</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Prompt Display */}
                        <div className="border rounded-lg overflow-hidden">
                            {/* Header del prompt activo */}
                            <div className={`p-4 transition-colors duration-300 ${activePromptTab === 'research'
                                ? 'bg-blue-500 text-white'
                                : 'bg-purple-500 text-white'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg">
                                            {activePromptTab === 'research' ? '🔍 Research Prompt' : '📊 Analysis Prompt'}
                                        </h3>
                                        <p className="text-sm opacity-90">
                                            {activePromptTab === 'research'
                                                ? 'Paste this in NotebookLM to find sources'
                                                : 'Paste this in NotebookLM AFTER uploading sources'}
                                        </p>
                                    </div>
                                    <span className="text-2xl">
                                        {activePromptTab === 'research' ? '🔍' : '📊'}
                                    </span>
                                </div>
                            </div>

                            {/* Contenido del prompt */}
                            <div className="bg-gray-50 dark:bg-gray-900 p-4">
                                <pre className="bg-white dark:bg-gray-800 p-4 rounded text-xs font-mono overflow-auto max-h-96 border whitespace-pre-wrap">
                                    {activePromptTab === 'research' ? researchPrompt : analysisPrompt}
                                </pre>

                                {/* Info bar */}
                                <div className="flex items-center justify-between mt-3 text-sm text-gray-600 dark:text-gray-400">
                                    <span>
                                        {(activePromptTab === 'research' ? researchPrompt : analysisPrompt).length} characters
                                    </span>
                                    {activePromptTab === 'analysis' && (
                                        <span className="flex items-center gap-2">
                                            📚 {formValues.chapter_count || 12} chapters requested
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 flex gap-3">
                                <button
                                    onClick={() => handleCopyPrompt(
                                        activePromptTab === 'research' ? researchPrompt : analysisPrompt,
                                        activePromptTab
                                    )}
                                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${copiedPrompt === activePromptTab
                                        ? 'bg-green-500 text-white'
                                        : activePromptTab === 'research'
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                                        }`}
                                >
                                    {copiedPrompt === activePromptTab ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Check className="h-5 w-5" /> Copied to Clipboard!
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Clipboard className="h-5 w-5" /> Copy {activePromptTab === 'research' ? 'Research' : 'Analysis'} Prompt
                                        </span>
                                    )}
                                </button>

                                {/* Switch prompt button */}
                                <button
                                    onClick={() => setActivePromptTab(
                                        activePromptTab === 'research' ? 'analysis' : 'research'
                                    )}
                                    className="py-3 px-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm"
                                >
                                    Switch to {activePromptTab === 'research' ? 'Analysis' : 'Research'} →
                                </button>
                            </div>
                        </div>

                        {/* Help section */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                            <h4 className="font-bold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
                                💡 Pro Tip
                            </h4>
                            <div className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                                {activePromptTab === 'research' ? (
                                    <p>
                                        After NotebookLM suggests sources, <strong>download the PDFs</strong> it recommends,
                                        then upload them to NotebookLM and switch to the <strong>Analysis Prompt</strong> to continue.
                                    </p>
                                ) : (
                                    <p>
                                        Make sure you've uploaded <strong>at least 5-10 PDF sources</strong> to NotebookLM
                                        before using this prompt for best results.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Footer buttons */}
                        <div className="flex justify-between items-center pt-4 border-t">
                            <button
                                onClick={() => setStep(2)}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                            >
                                ← Back to Form
                            </button>
                            <button
                                onClick={() => onComplete(analysisPrompt, selectedTemplate?.generationConfig, formValues)}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shadow-purple-200"
                            >
                                ✅ Continue to Editor
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
