'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PageViewTracker() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const supabase = createClient()
    const lastPathRef = useRef<string | null>(null)

    useEffect(() => {
        const trackView = async () => {
            // Construct full path including query params
            const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')

            // Prevent duplicate tracking in Strict Mode (dev) or rapid double-fires
            if (lastPathRef.current === fullPath) return
            lastPathRef.current = fullPath

            try {
                // Get basic user agent info
                const userAgent = window.navigator.userAgent

                await supabase.from('page_views').insert({
                    path: fullPath,
                    user_agent: userAgent,
                } as any)
            } catch (error) {
                console.error('Error tracking view:', error)
            }
        }

        // Small timeout to ensure navigation settled
        const timer = setTimeout(trackView, 500)
        return () => clearTimeout(timer)

    }, [pathname, searchParams])

    return null
}
