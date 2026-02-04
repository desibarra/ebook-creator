import { useRouter } from 'next/navigation'
import { Check, ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/lib/utils'

import { projectService } from '../services/projectService'
import { CreateProjectDTO } from '../types'

interface CreateProjectDialogProps {
    onCreate: (data: CreateProjectDTO) => Promise<any>
}

type Step = {
    id: string
    title: string
    description: string
}

const STEPS: Step[] = [
    { id: 'basics', title: 'Project Basics', description: 'Start with the main topic' },
    { id: 'audience', title: 'Target Audience', description: 'Who is this for?' },
    { id: 'purpose', title: 'Goals & Purpose', description: 'What should readers achieve?' },
    { id: 'tone', title: 'Tone & Style', description: 'How should it sound?' },
    { id: 'review', title: 'Review', description: 'Confirm your details' },
]

export function CreateProjectDialog({ onCreate }: CreateProjectDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState<CreateProjectDTO>({
        title: '',
        topic: '',
        audience: '',
        purpose: '',
        tone: '',
    })

    // Log changes for debugging
    const updateField = (field: keyof CreateProjectDTO, value: string) => {
        console.log(`📝 Updating field [${field}]:`, value)
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleNext = () => {
        console.log(`🔍 Step ${currentStep} validation:`, isStepValid())
        console.log('Current Data:', formData)

        if (isStepValid()) {
            if (currentStep < STEPS.length - 1) {
                setCurrentStep((prev) => prev + 1)
            }
        } else {
            toast.error('Por favor completa los campos requeridos con la longitud mínima.')
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1)
        }
    }

    const handleSubmit = async () => {
        try {
            setLoading(true)
            setLoadingMessage('Creating project...')

            // 1. Create the project record
            const newProject = await onCreate(formData)

            // 2. Redirect to Editor
            setLoadingMessage('Redirecting...')
            setOpen(false)
            resetForm()
            router.push(`/editor/${newProject.id}`)

        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to create project')
        } finally {
            setLoading(false)
            setLoadingMessage('')
        }
    }

    const resetForm = () => {
        setCurrentStep(0)
        setFormData({
            title: '',
            topic: '',
            audience: '',
            purpose: '',
            tone: '',
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleNext()
        }
    }

    const isStepValid = () => {
        switch (currentStep) {
            case 0: // Basics
                return formData.title.trim().length >= 3 && (formData.topic?.trim()?.length || 0) >= 3
            case 1: // Audience
                return (formData.audience?.trim()?.length || 0) >= 3
            case 2: // Purpose
                return (formData.purpose?.trim()?.length || 0) >= 5
            case 3: // Tone
                return (formData.tone?.trim()?.length || 0) >= 3
            default:
                return true
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) resetForm()
        }}>
            <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                    <Plus className="h-4 w-4" />
                    New eBook
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
                <div className="bg-muted/30 p-6 border-b">
                    <div className="flex items-center justify-between mb-2">
                        <DialogTitle className="text-xl">Create New eBook</DialogTitle>
                        <span className="text-sm text-muted-foreground">
                            Step {currentStep + 1} of {STEPS.length}
                        </span>
                    </div>
                    <DialogDescription>
                        {STEPS[currentStep].description}
                    </DialogDescription>

                    {/* Progress Indicator */}
                    <div className="flex gap-1 mt-4">
                        {STEPS.map((_, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "h-1 flex-1 rounded-full transition-colors",
                                    index <= currentStep ? "bg-primary" : "bg-muted"
                                )}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-6 min-h-[300px]">
                    {currentStep === 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 font-bold">
                                        Project Title <span className="text-red-500">*</span>
                                    </span>
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                                        formData.title.length >= 3 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                                    )}>
                                        {formData.title.length >= 3 ? 'Ready' : 'Required'}
                                    </span>
                                </Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="e.g. The Ultimate Guide to React"
                                    className={cn(
                                        "h-12 text-lg",
                                        formData.title.length > 0 && formData.title.length < 3 && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="topic" className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 font-bold">
                                        Main Topic <span className="text-red-500">*</span>
                                    </span>
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                                        (formData.topic?.length || 0) >= 3 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                                    )}>
                                        {(formData.topic?.length || 0) >= 3 ? 'Ready' : 'Required'}
                                    </span>
                                </Label>
                                <Input
                                    id="topic"
                                    value={formData.topic || ''}
                                    onChange={(e) => updateField('topic', e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="e.g. React hooks and state management"
                                    className={cn(
                                        "h-12 text-lg",
                                        (formData.topic?.length || 0) > 0 && (formData.topic?.length || 0) < 3 && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                />
                                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg border border-dashed">
                                    💡 <strong>Tip:</strong> Describe de qué trata tu libro en una frase. Esto ayuda a la IA a darte mejores resultados.
                                </p>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="audience" className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 font-bold">
                                        Target Audience <span className="text-red-500">*</span>
                                    </span>
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                                        (formData.audience?.length || 0) >= 3 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                                    )}>
                                        {(formData.audience?.length || 0) >= 3 ? 'Ready' : 'Required'}
                                    </span>
                                </Label>
                                <Input
                                    id="audience"
                                    value={formData.audience}
                                    onChange={(e) => updateField('audience', e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="e.g. Junior developers, Marketing professionals"
                                    className={cn(
                                        "h-12 text-lg",
                                        (formData.audience?.length || 0) > 0 && (formData.audience?.length || 0) < 3 && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    autoFocus
                                />
                                <p className="text-sm text-muted-foreground">
                                    Who are you writing for? What is their experience level?
                                </p>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="purpose" className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 font-bold">
                                        Goal & Purpose <span className="text-red-500">*</span>
                                    </span>
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                                        (formData.purpose?.length || 0) >= 5 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                                    )}>
                                        {(formData.purpose?.length || 0) >= 5 ? 'Ready' : 'Required'}
                                    </span>
                                </Label>
                                <Input
                                    id="purpose"
                                    value={formData.purpose}
                                    onChange={(e) => updateField('purpose', e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="e.g. To teach best practices, To generate leads"
                                    className={cn(
                                        "h-12 text-lg",
                                        (formData.purpose?.length || 0) > 0 && (formData.purpose?.length || 0) < 5 && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    autoFocus
                                />
                                <p className="text-sm text-muted-foreground">
                                    What should the reader achieve after reading this?
                                </p>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="tone" className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 font-bold">
                                        Tone & Style <span className="text-red-500">*</span>
                                    </span>
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                                        (formData.tone?.length || 0) >= 3 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                                    )}>
                                        {(formData.tone?.length || 0) >= 3 ? 'Ready' : 'Required'}
                                    </span>
                                </Label>
                                <Input
                                    id="tone"
                                    value={formData.tone}
                                    onChange={(e) => updateField('tone', e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="e.g. Professional yet friendly, Technical, Inspirational"
                                    className={cn(
                                        "h-12 text-lg",
                                        (formData.tone?.length || 0) > 0 && (formData.tone?.length || 0) < 3 && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    autoFocus
                                />
                                <p className="text-sm text-muted-foreground">
                                    How should the content sound?
                                </p>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="font-medium text-lg">Review Project Details</h3>
                            <div className="grid gap-4 text-sm">
                                <div className="grid grid-cols-3 gap-4 border-b pb-2">
                                    <span className="text-muted-foreground font-medium">Title</span>
                                    <span className="col-span-2">{formData.title}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 border-b pb-2">
                                    <span className="text-muted-foreground font-medium">Topic</span>
                                    <span className="col-span-2">{formData.topic}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 border-b pb-2">
                                    <span className="text-muted-foreground font-medium">Audience</span>
                                    <span className="col-span-2">{formData.audience}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 border-b pb-2">
                                    <span className="text-muted-foreground font-medium">Purpose</span>
                                    <span className="col-span-2">{formData.purpose}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 border-b pb-2">
                                    <span className="text-muted-foreground font-medium">Tone</span>
                                    <span className="col-span-2">{formData.tone}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 border-t bg-muted/10">
                    <div className="flex justify-between w-full">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={currentStep === 0 || loading}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>

                        {currentStep === STEPS.length - 1 ? (
                            <Button onClick={handleSubmit} disabled={loading} className="min-w-[140px]">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {loadingMessage || 'Creating...'}
                                    </>
                                ) : (
                                    'Create Project'
                                )}
                            </Button>
                        ) : (
                            <div className="flex flex-col items-end gap-2">
                                {!isStepValid() && currentStep < STEPS.length - 1 && (
                                    <span className="text-[10px] font-black uppercase text-red-500 animate-pulse">
                                        ⚠️ Completa los campos obligatorios para continuar
                                    </span>
                                )}
                                <Button
                                    onClick={handleNext}
                                    disabled={loading}
                                    className={cn(
                                        "min-w-[120px] transition-all h-10 font-bold",
                                        !isStepValid() ? "bg-muted text-muted-foreground grayscale cursor-not-allowed" : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200"
                                    )}
                                >
                                    Next Step
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
