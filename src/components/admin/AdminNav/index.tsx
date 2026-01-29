'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Briefcase,
    DollarSign,
    Image as ImageIcon,
    LogOut,
    Menu,
    X,
    BarChart
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { User } from '@supabase/supabase-js'

interface NavLink {
    href: string
    label: string
    icon: React.ElementType
}

const navLinks: NavLink[] = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/clientes', label: 'Clientes', icon: Users },
    { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart }, // Added Analytics item
    { href: '/admin/financeiro', label: 'Financeiro', icon: DollarSign },
    { href: '/admin/portfolio', label: 'Portfólio', icon: ImageIcon },
]

export default function AdminNav({ user }: { user: User }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/auth/login')
        router.refresh()
    }

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface backdrop-blur-md text-foreground rounded-xl shadow-lg border border-white/10"
            >
                {mobileMenuOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <Menu className="w-6 h-6" />
                )}
            </button>

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 z-40 h-screen w-72 
          bg-background/50 backdrop-blur-xl border-r border-white/5
          transition-transform duration-300 lg:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="flex flex-col h-full bg-gradient-to-b from-transparent to-background/80">
                    {/* Logo */}
                    <div className="p-8 pb-8">
                        <div className="mb-2 relative">
                            <Image
                                src="/logo.png"
                                alt="Mazzetto Studio"
                                width={180}
                                height={45}
                                className="h-auto w-full max-w-[150px] object-contain brightness-0 invert drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                                priority
                            />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                        <p className="px-4 text-xs font-bold text-foreground-muted/50 uppercase tracking-[0.2em] mb-4">Menu</p>
                        {navLinks.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href ||
                                (link.href !== '/admin' && pathname.startsWith(link.href))

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`
                    relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden
                    ${isActive
                                            ? 'bg-white/[0.03] text-foreground'
                                            : 'text-foreground-muted hover:text-foreground hover:bg-white/[0.02]'
                                        }
                  `}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-blue to-accent-purple shadow-[0_0_10px_rgba(99,102,241,0.5)] rounded-r-full" />
                                    )}

                                    <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-accent-blue drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'group-hover:text-accent-blue'}`} />

                                    <span className={`font-medium tracking-wide transition-all ${isActive ? 'bg-clip-text text-transparent bg-gradient-to-r from-accent-blue via-indigo-400 to-white' : ''}`}>
                                        {link.label}
                                    </span>

                                    {/* Hover Glow Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User info & Logout */}
                    <div className="p-4 mt-auto">
                        <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/5 backdrop-blur-sm group hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shadow-inner">
                                    <span className="text-foreground text-sm font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] uppercase tracking-wider text-foreground-muted/70 font-bold">Logado como</p>
                                    <p className="text-sm font-medium text-foreground truncate drop-shadow-sm">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-accent-red/10 text-foreground-muted hover:text-accent-red rounded-xl transition-all text-xs font-bold uppercase tracking-wider border border-white/[0.02] hover:border-accent-red/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Encerrar Sessão</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-30"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </>
    )
}
