import { createClient } from '@/lib/supabase/server'
// Admin Layout Component
import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'
import TopBar from '@/components/admin/TopBar'
import Footer from '@/components/Footer'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <AdminNav user={user} />

            {/* Main Content */}
            <div className="lg:pl-72 transition-all duration-300 min-h-screen flex flex-col">
                <TopBar user={user} />
                <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex-1">
                    {children}
                </main>
                <Footer variant="dark" />
            </div>
        </div>
    )
}
