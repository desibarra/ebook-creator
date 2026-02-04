
import { Metadata } from 'next'
import { ProjectDashboard } from '@/features/projects/components/ProjectDashboard'

export const metadata: Metadata = {
    title: 'Dashboard | eBook Creator',
    description: 'Manage your eBook projects',
}

export default function DashboardPage() {
    return <ProjectDashboard />
}
