
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Wand2, Target, Users, Megaphone, Palette } from 'lucide-react';
import { projectService } from '../services/projectService';
import { CreateProjectDTO } from '../types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

export function CreateProjectWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateProjectDTO>({
        title: '',
        topic: '',
        audience: '',
        purpose: '',
        tone: '',
    });

    const totalSteps = 5;

    // Persistence: Save to localStorage
    useEffect(() => {
        const draft = localStorage.getItem('draft-project');
        if (draft) {
            try {
                setFormData(JSON.parse(draft));
            } catch (e) {
                console.error('Error parsing draft:', e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('draft-project', JSON.stringify(formData));
    }, [formData]);

    const updateField = (field: keyof CreateProjectDTO, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleNext = () => {
        if (isStepValid() && step < totalSteps) {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(prev => prev - 1);
        }
    };

    const isStepValid = () => {
        switch (step) {
            case 1: return formData.title.trim().length >= 3;
            case 2: return (formData.topic?.trim()?.length || 0) >= 10;
            case 3: return (formData.audience?.trim()?.length || 0) >= 5;
            case 4: return (formData.purpose?.trim()?.length || 0) >= 5;
            case 5: return (formData.tone?.trim()?.length || 0) >= 3;
            default: return true;
        }
    };

    const handleSubmit = async () => {
        if (!isStepValid()) return;

        setLoading(true);
        try {
            const project = await projectService.createProject(formData);
            localStorage.removeItem('draft-project');
            toast.success('¡Proyecto creado con éxito!');
            router.push(`/editor/${project.id}`);
        } catch (error: any) {
            console.error('Error creating project:', error);
            toast.error(error.message || 'Error al crear el proyecto');
        } finally {
            setLoading(false);
        }
    };

    const stepsInfo = [
        { title: 'Título del Proyecto', icon: <Wand2 className="w-5 h-5" />, description: 'Dale un nombre a tu futura obra maestra.' },
        { title: 'Tema Principal', icon: <Sparkles className="w-5 h-5" />, description: '¿De qué trata el libro? Sé lo más descriptivo posible.' },
        { title: 'Audiencia Ideal', icon: <Users className="w-5 h-5" />, description: '¿Quiénes son tus lectores? (ej. Principiantes, CEOs, Padres).' },
        { title: 'Propósito', icon: <Target className="w-5 h-5" />, description: '¿Qué quieres lograr? (Enseñar, vender, inspirar).' },
        { title: 'Tono y Estilo', icon: <Megaphone className="w-5 h-5" />, description: '¿Cómo debe sonar? (Profesional, divertido, técnico).' },
    ];

    return (
        <div className="max-w-2xl mx-auto w-full">
            {/* Progress bar */}
            <div className="mb-12 space-y-4">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-widest text-blue-600">Paso {step} de {totalSteps}</p>
                        <h1 className="text-3xl font-black tracking-tight">{stepsInfo[step - 1].title}</h1>
                    </div>
                    <p className="text-sm font-bold text-slate-400">{Math.round((step / totalSteps) * 100)}%</p>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                    <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </div>
            </div>

            {/* Step Content */}
            <div className="min-h-[300px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                    <div className="flex items-center gap-3 text-blue-600 mb-2">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            {stepsInfo[step - 1].icon}
                        </div>
                        <p className="font-bold text-lg">{stepsInfo[step - 1].description}</p>
                    </div>

                    {step === 1 && (
                        <div className="space-y-4">
                            <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-slate-400">Título Sugerido</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                placeholder="Ej. El Camino hacia el Éxito Financiero"
                                className="h-14 text-xl font-bold rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <Label htmlFor="topic" className="text-sm font-bold uppercase tracking-wider text-slate-400">Descripción del Tema</Label>
                            <Textarea
                                id="topic"
                                value={formData.topic}
                                onChange={(e) => updateField('topic', e.target.value)}
                                placeholder="Describe brevemente el contenido principal, capítulos clave o ideas que quieres incluir..."
                                className="min-h-[180px] text-lg rounded-24 border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none p-6"
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <Label htmlFor="audience" className="text-sm font-bold uppercase tracking-wider text-slate-400">Público Objetivo</Label>
                            <Input
                                id="audience"
                                value={formData.audience}
                                onChange={(e) => updateField('audience', e.target.value)}
                                placeholder="Ej. Emprendedores principiantes de 20-35 años"
                                className="h-14 text-xl font-bold rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4">
                            <Label htmlFor="purpose" className="text-sm font-bold uppercase tracking-wider text-slate-400">Meta del eBook</Label>
                            <Input
                                id="purpose"
                                value={formData.purpose}
                                onChange={(e) => updateField('purpose', e.target.value)}
                                placeholder="Ej. Educar sobre el mercado inmobiliario y captar prospectos"
                                className="h-14 text-xl font-bold rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-4">
                            <Label htmlFor="tone" className="text-sm font-bold uppercase tracking-wider text-slate-400">Personalidad de la Marca</Label>
                            <Input
                                id="tone"
                                value={formData.tone}
                                onChange={(e) => updateField('tone', e.target.value)}
                                placeholder="Ej. Profesional, Inspirador, Directo y Técnico"
                                className="h-14 text-xl font-bold rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                autoFocus
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="mt-12 flex justify-between items-center">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={step === 1 || loading}
                    className="h-12 px-8 rounded-2xl font-bold text-slate-500 hover:text-slate-900 transition-all flex gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Atrás
                </Button>

                {step < totalSteps ? (
                    <Button
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        className="h-14 px-10 rounded-2xl font-black text-lg bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex gap-2 disabled:opacity-30 disabled:grayscale"
                    >
                        Siguiente Paso
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !isStepValid()}
                        className="h-14 px-10 rounded-2xl font-black text-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Creando...
                            </>
                        ) : (
                            <>
                                Crear Mi eBook
                                <Sparkles className="w-6 h-6" />
                            </>
                        )}
                    </Button>
                )}
            </div>

            {!isStepValid() && (
                <p className="text-center mt-6 text-xs font-black uppercase tracking-widest text-red-500 animate-pulse">
                    ⚠️ Completa el campo correctamente para continuar
                </p>
            )}
        </div>
    );
}
