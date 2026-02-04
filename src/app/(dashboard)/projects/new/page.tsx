
import { Metadata } from 'next'
import { CreateProjectWizard } from '@/features/projects/components/CreateProjectWizard'

export const metadata: Metadata = {
    title: 'Nuevo eBook | eBook Creator',
    description: 'Crea un nuevo proyecto de eBook paso a paso.',
}

export default function NewProjectPage() {
    return (
        <div className="min-h-screen py-12 px-4 bg-muted/30">
            <div className="container mx-auto">
                <div className="text-center mb-12 space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter">Empecemos tu historia</h1>
                    <p className="text-muted-foreground text-lg">Define la visión de tu eBook en pocos pasos.</p>
                </div>
                <CreateProjectWizard />
            </div>
        </div>
    )
}
