import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'
import { SupabaseProvider } from '@/shared/providers/SupabaseProvider'

export const metadata: Metadata = {
  title: 'eBook Creator - Create Professional eBooks in Minutes',
  description:
    'Create, edit, and export professional eBooks without design skills. Perfect for marketers, coaches, and content creators.',
  keywords: ['ebook', 'creator', 'pdf', 'editor', 'digital publishing'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SupabaseProvider>
          {children}
          <Toaster position="top-center" richColors />
        </SupabaseProvider>
      </body>
    </html>
  )
}
