'use client'

import { useState, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            if (data.user) {
                router.push('/admin')
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-purple/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-blue/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
            </div>

            <div className="relative w-full max-w-md px-6 animate-in fade-in zoom-in duration-500">
                <div className="bg-surface/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-8 md:p-10 space-y-8">

                    {/* Logo/Title */}
                    <div className="text-center space-y-4 flex flex-col items-center">
                        <div className="relative w-48 h-12 mb-2">
                            <Image
                                src="/logo.png"
                                alt="Mazzetto Studio"
                                fill
                                className="object-contain brightness-0 invert drop-shadow-lg"
                                priority
                            />
                        </div>
                        <p className="text-foreground-muted text-sm font-medium uppercase tracking-widest">
                            Painel Administrativo
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center shadow-inner">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-xs font-bold text-foreground-muted uppercase tracking-wider pl-1">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3.5 bg-background/50 border border-white/10 rounded-xl text-foreground placeholder-white/20 focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/50 transition-all shadow-inner"
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-xs font-bold text-foreground-muted uppercase tracking-wider pl-1">
                                    Senha
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3.5 bg-background/50 border border-white/10 rounded-xl text-foreground placeholder-white/20 focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/50 transition-all shadow-inner"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-4 bg-gradient-to-r from-accent-purple via-indigo-600 to-accent-purple bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white font-bold rounded-xl shadow-lg shadow-accent-purple/25 hover:shadow-accent-purple/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                            {loading ? 'Acessando...' : 'Entrar no Painel'}
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <a
                            href="/"
                            className="text-xs font-medium text-foreground-muted hover:text-white transition-colors uppercase tracking-wider group"
                        >
                            <span className="group-hover:-translate-x-1 inline-block transition-transform">←</span> Voltar para o site
                        </a>
                    </div>
                </div>

                <p className="text-center mt-8 text-[10px] text-white/20 uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} Mazzetto Studio
                </p>
            </div>
        </div>
    )
}
