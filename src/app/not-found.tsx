import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <FileQuestion className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  )
}
