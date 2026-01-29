'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lock, Loader2, X } from 'lucide-react'

interface ChangePasswordModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const supabase = createClient()

    if (!isOpen) return null

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' })
            setLoading(false)
            return
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' })
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword })

            if (error) throw error

            setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' })
            setNewPassword('')
            setConfirmPassword('')

            // Auto close after success
            setTimeout(() => {
                onClose()
                setMessage(null)
            }, 2000)

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Erro ao atualizar senha.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent-purple/10 rounded-lg">
                            <Lock className="w-5 h-5 text-accent-purple" />
                        </div>
                        <h3 className="font-bold text-foreground">Alterar Senha</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-foreground-muted hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
                    {message && (
                        <div className={`p-3 rounded-lg text-sm border ${message.type === 'success'
                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Nova Senha</label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-surface-highlight border border-transparent focus:border-accent-purple/50 rounded-xl px-4 py-3 text-foreground outline-none transition-all placeholder:text-white/20"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Confirmar Nova Senha</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-surface-highlight border border-transparent focus:border-accent-purple/50 rounded-xl px-4 py-3 text-foreground outline-none transition-all placeholder:text-white/20"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[image:var(--gradient-glow)] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 mt-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Atualizando...' : 'Salvar Nova Senha'}
                    </button>
                </form>
            </div>
        </div>
    )
}
