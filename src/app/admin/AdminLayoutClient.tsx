'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import TopBar from '@/components/admin/TopBar'
import ChangePasswordModal from '@/components/admin/ChangePasswordModal'
import AdminNav from '@/components/admin/AdminNav'
import Footer from '@/components/Footer'

interface AdminLayoutClientProps {
    user: User
    children: React.ReactNode
}

export default function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <AdminNav user={user} />

            {/* Main Content */}
            <div className="lg:pl-72 transition-all duration-300 min-h-screen flex flex-col">
                <TopBar
                    user={user}
                    onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
                />
                <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex-1">
                    {children}
                </main>
                <Footer variant="dark" />
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </div>
    )
}
