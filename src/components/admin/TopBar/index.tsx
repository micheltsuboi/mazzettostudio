'use client'

import type { User } from '@supabase/supabase-js'
import { Bell } from 'lucide-react'

interface TopBarProps {
    user: User
    onOpenPasswordModal: () => void
}

export default function TopBar({ user, onOpenPasswordModal }: TopBarProps) {
    return (
        <header className="sticky top-0 z-10 bg-transparent px-6 lg:px-10 py-6">
            <div className="flex items-center justify-between">
                {/* Page title will be added later by individual pages */}
                <div className="lg:hidden w-16"></div>

                <div className="flex-1"></div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button className="p-2.5 rounded-xl hover:bg-surface border border-transparent hover:border-border text-foreground-muted hover:text-foreground transition-all">
                        <Bell className="w-5 h-5" />
                    </button>

                    <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-border relative group">
                        <button
                            onClick={onOpenPasswordModal}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-indigo-600 flex items-center justify-center shadow-lg shadow-accent-purple/20 hover:scale-105 transition-transform"
                            title="Alterar Senha"
                        >
                            <span className="text-white text-sm font-bold">
                                {user.email?.charAt(0).toUpperCase()}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
