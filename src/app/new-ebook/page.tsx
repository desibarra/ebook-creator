
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TemplateSelector from '@/features/editor/components/TemplateSelector';
import { projectService } from '@/features/projects/services/projectService';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function NewEbookPage() {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);

    const handleTemplateComplete = async (
        prompt: string,
        _config: Record<string, unknown>,
        templateData: Record<string, string>
    ) => {
        setIsCreating(true);

        try {
            // Determine a title from template data
            const title = templateData.ebook_topic ||
                templateData.condition_name ||
                templateData.business_topic ||
                'Untitled eBook';

            // Create project in database
            const project = await projectService.createProject({
                title,
                topic: title,
                audience: templateData.target_audience || 'General',
                purpose: 'Educational',
                tone: 'Professional'
            });

            if (project) {
                toast.success("eBook created successfully!");
                // Redirect to the editor
                router.push(`/editor/${project.id}`);
            }
        } catch (error: unknown) {
            console.error('Error creating eBook:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            toast.error('Hubo un error al crear el proyecto: ' + errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 animate-in fade-in duration-700">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-black tracking-tighter">Crea tu próximo Masterpiece</h1>
                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                        Selecciona una estructura optimizada y deja que nuestro sistema inteligente te guíe en el proceso de creación.
                    </p>
                </div>

                <div className="bg-background rounded-[40px] shadow-2xl shadow-blue-500/5 border-2 p-4 md:p-8 lg:p-12 min-h-[600px] flex items-center justify-center">
                    <TemplateSelector onComplete={handleTemplateComplete} />
                </div>
            </div>

            {isCreating && (
                <div className="fixed inset-0 bg-background/90 backdrop-blur-xl flex items-center justify-center z-[100] animate-in fade-in duration-500">
                    <div className="flex flex-col items-center gap-8 text-center max-w-sm">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                            <div className="relative bg-blue-600 w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                                <Loader2 className="h-12 w-12 text-white animate-spin" />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-purple-500 p-2 rounded-xl shadow-lg border-2 border-white animate-bounce">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tight">Creating your eBook...</h2>
                            <p className="text-muted-foreground font-medium">Configuring the project and preparing the AI workspace.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
