import { NextResponse } from 'next/server'

export async function GET() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const results: any = {
        url_exists: !!url,
        key_exists: !!key,
        url_value: url ? `${url.substring(0, 20)}...` : 'null',
        fetch_test: null,
        error: null
    }

    try {
        if (url) {
            // Intentar un fetch básico a la API de Supabase sin usar el SDK
            const start = Date.now()
            const response = await fetch(`${url}/rest/v1/`, {
                headers: {
                    'apikey': key || '',
                    'Authorization': `Bearer ${key || ''}`
                }
            })
            results.fetch_test = {
                status: response.status,
                statusText: response.statusText,
                duration: `${Date.now() - start}ms`
            }
        }
    } catch (err: any) {
        results.error = {
            message: err.message,
            stack: err.stack,
            name: err.name
        }
    }

    return NextResponse.json(results)
}
