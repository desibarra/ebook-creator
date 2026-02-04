
import { createClient } from '@/shared/lib/supabase/client';

export async function uploadImage(
    file: File,
    userId: string,
    projectId: string
): Promise<string> {
    const supabase = createClient();

    // 1. Validations
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
        throw new Error('El archivo es demasiado grande (máximo 5MB)');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        throw new Error('Formato no permitido. Usa JPG, PNG, WebP or GIF.');
    }

    // 2. Prepare path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${projectId}/${fileName}`;

    // 3. Upload to bucket 'ebook-images'
    const { data, error } = await supabase.storage
        .from('ebook-images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Error uploading image:', error);
        throw new Error(error.message);
    }

    // 4. Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('ebook-images')
        .getPublicUrl(filePath);

    return publicUrl;
}

export async function deleteImage(url: string) {
    const supabase = createClient();

    // Extract path from URL
    // URL format: .../storage/v1/object/public/ebook-images/USER_ID/PROJECT_ID/FILE_NAME
    const parts = url.split('ebook-images/');
    if (parts.length < 2) return;

    const filePath = parts[1];

    const { error } = await supabase.storage
        .from('ebook-images')
        .remove([filePath]);

    if (error) console.error('Error deleting image from storage:', error);
}
