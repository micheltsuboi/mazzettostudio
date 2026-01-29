'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Categoria = Database['public']['Tables']['categorias_portfolio']['Row']

export default function Header() {
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const fetchCategorias = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('categorias_portfolio')
                .select('*')
                .eq('ativo', true)
                .order('ordem', { ascending: true })

            if (data) setCategorias(data)
        }

        fetchCategorias()

        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 bg-background transition-all duration-300 ${scrolled ? 'shadow-sm py-4' : 'py-8'}`}>
            <div className="container mx-auto px-4 flex flex-col items-center gap-6">

                {/* Logo */}
                <Link href="/" className="block relative h-12 w-48 md:h-16 md:w-64 transition-transform duration-300 hover:scale-105">
                    <img
                        src="/logo.png"
                        alt="MAZZETTO STUDIO"
                        className={`w-full h-full object-contain object-center transition-all duration-300 ${scrolled ? 'scale-90' : 'scale-100'}`}
                    />
                </Link>

                {/* Navigation */}
                <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs md:text-sm font-medium tracking-widest uppercase">
                    <Link href="/" className="hover:text-foreground-muted transition-colors relative group">
                        Home
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full" />
                    </Link>

                    {categorias.map(categoria => (
                        <Link
                            key={categoria.id}
                            href={`/categoria/${categoria.slug}`}
                            className="hover:text-foreground-muted transition-colors relative group"
                        >
                            {categoria.nome}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full" />
                        </Link>
                    ))}

                    <Link href="/contato" className="hover:text-foreground-muted transition-colors relative group">
                        Contato
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full" />
                    </Link>
                </nav>
            </div>
        </header>
    )
}
