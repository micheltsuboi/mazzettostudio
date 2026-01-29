'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Database } from '@/types/database.types'

type Categoria = Database['public']['Tables']['categorias_portfolio']['Row']

interface HeaderProps {
    categorias: Categoria[]
}

export default function Header({ categorias }: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Scroll to section handling
    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault()
        setMobileMenuOpen(false)
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-white/20 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="z-50">
                        <Image
                            src="/logo.png"
                            alt="Mazzetto Studio"
                            width={200}
                            height={50}
                            className="h-16 md:h-20 w-auto object-contain"
                            priority
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            href="/"
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Portfólio
                        </Link>

                        {/* Categorias */}
                        {categorias.map(cat => (
                            <a
                                key={cat.id}
                                href={`#${cat.slug}`}
                                onClick={(e) => handleScroll(e, cat.slug)}
                                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                {cat.nome}
                            </a>
                        ))}

                        <Link
                            href="/contato"
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Contato
                        </Link>

                        <Link
                            href="/auth/login"
                            className="text-xs font-medium bg-slate-100 text-slate-900 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors"
                        >
                            Admin
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden z-50 p-2 text-slate-900"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>

                    {/* Mobile Nav */}
                    <div className={`
            fixed inset-0 bg-white z-40 flex flex-col items-center justify-center space-y-8 transition-all duration-300
            ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
          `}>
                        <Link
                            href="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-xl font-medium text-slate-900"
                        >
                            Portfólio
                        </Link>

                        {categorias.map(cat => (
                            <a
                                key={cat.id}
                                href={`#${cat.slug}`}
                                onClick={(e) => handleScroll(e, cat.slug)}
                                className="text-xl font-medium text-slate-600"
                            >
                                {cat.nome}
                            </a>
                        ))}

                        <Link
                            href="/contato"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-xl font-medium text-slate-900"
                        >
                            Contato
                        </Link>

                        <Link
                            href="/auth/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-sm font-medium bg-slate-100 px-4 py-2 rounded-full"
                        >
                            Área do Admin
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    )
}
