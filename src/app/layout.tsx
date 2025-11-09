import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import { SupabaseProvider } from '@/shared/providers/SupabaseProvider'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <SupabaseProvider>
          {children}
          <Toaster position="top-center" richColors />
        </SupabaseProvider>
      </body>
    </html>
  )
}
