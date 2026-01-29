import type { Metadata } from 'next'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
    title: 'Mazzetto Studio',
    description: 'High-end Digital Retouch for Fashion and Advertising',
}

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="light-theme min-h-screen bg-background text-foreground selection:bg-black selection:text-white font-sans flex flex-col">
            <div className="flex-1">
                {children}
            </div>
            <Footer variant="light" />
        </div>
    )
}
