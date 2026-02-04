
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import { aiService } from '@/features/ai/services/aiService';
import { ProjectContent } from '@/features/projects/types';

export async function POST(request: NextRequest) {
    try {
        const { projectId } = await request.json();

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Verify Authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Project to get params
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('content, title')
            .eq('id', projectId)
            .eq('user_id', user.id) // Security check: must own the project
            .single();

        if (projectError || !project) {
            console.error('Error fetching project:', projectError);
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Cast content to our known type
        const content = project.content as unknown as ProjectContent;
        const generationParams = content?.generationParams;

        // 3. Construct Params for AI
        const params = {
            title: project.title,
            topic: generationParams?.topic || project.title,
            audience: generationParams?.audience || 'General audience',
            purpose: generationParams?.purpose || 'Informative',
            tone: generationParams?.tone || 'Neutral'
        };

        // 4. Generate Content
        const blocks = await aiService.generateEbookContent(params);

        // 5. Update Project with generated blocks
        const newContent = {
            ...content,
            blocks: blocks,
            version: (content?.version || 0) + 1
        };

        const { error: updateError } = await supabase
            .from('projects')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .update({ content: newContent as any }) // Cast to any for Supabase Json type compatibility
            .eq('id', projectId);

        if (updateError) {
            console.error('Error updating project:', updateError);
            return NextResponse.json({ error: 'Failed to save generated content' }, { status: 500 });
        }

        return NextResponse.json({ success: true, blocks });

    } catch (error: unknown) {
        console.error('Error in generate route:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}
