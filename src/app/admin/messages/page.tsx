'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Loader2, Check, Clock, Trash2, Search } from 'lucide-react'

export default function MessagesPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [messages, setMessages] = useState<any[]>([])
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    useEffect(() => {
        fetchMessages()
    }, [])

    const fetchMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('contacts')
                .select('*')
                .order('created_at', { ascending: false }) as any

            if (error) throw error
            setMessages(data || [])
        } catch (error) {
            console.error('Error fetching messages:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleReadStatus = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setMessages(messages.map(msg =>
            msg.id === id ? { ...msg, read: !currentStatus } : msg
        ))

        try {
            await supabase
                .from('contacts')
                .update({ read: !currentStatus } as any)
                .eq('id', id)
        } catch (error) {
            console.error('Error updating status:', error)
            await fetchMessages() // Revert on error
        }
    }

    const deleteMessage = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta mensagem?')) return

        setMessages(messages.filter(msg => msg.id !== id))

        try {
            await supabase
                .from('contacts')
                .delete()
                .eq('id', id) as any
        } catch (error) {
            console.error('Error deleting message:', error)
            await fetchMessages()
        }
    }

    const filteredMessages = messages.filter(msg => {
        if (filter === 'unread') return !msg.read
        return true
    })

    const unreadCount = messages.filter(m => !m.read).length

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 rounded-full border-2 border-accent-purple border-t-transparent animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Mensagens</h1>
                    <p className="text-foreground-muted">Gerencie os contatos recebidos pelo site</p>
                </div>

                <div className="flex bg-surface-highlight p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all'
                            ? 'bg-accent-purple text-white shadow-lg shadow-purple-500/20'
                            : 'text-foreground-muted hover:text-white'
                            }`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filter === 'unread'
                            ? 'bg-accent-purple text-white shadow-lg shadow-purple-500/20'
                            : 'text-foreground-muted hover:text-white'
                            }`}
                    >
                        Não Lidas
                        {unreadCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-accent-pink text-[10px] flex items-center justify-center text-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {filteredMessages.length === 0 ? (
                    <div className="text-center py-20 bg-surface/50 border border-white/5 rounded-2xl">
                        <Mail className="w-12 h-12 text-foreground-muted opacity-20 mx-auto mb-4" />
                        <p className="text-foreground-muted">Nenhuma mensagem encontrada.</p>
                    </div>
                ) : (
                    filteredMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`
                                group relative bg-surface border transition-all duration-300 rounded-2xl p-6
                                ${msg.read
                                    ? 'border-white/5 opacity-80 hover:opacity-100'
                                    : 'border-accent-purple/30 bg-accent-purple/5 shadow-[0_0_20px_rgba(139,92,246,0.05)]'
                                }
                            `}
                        >
                            <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className={`text-lg ${msg.read ? 'font-medium text-foreground-muted' : 'font-bold text-white'}`}>
                                            {msg.name}
                                        </h3>
                                        {!msg.read && (
                                            <span className="px-2 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple text-[10px] font-bold uppercase tracking-wider border border-accent-purple/20">
                                                Novo
                                            </span>
                                        )}
                                        <span className="text-xs text-foreground-muted/50 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(msg.created_at).toLocaleDateString('pt-BR')} às {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-accent-blue">
                                        <Mail className="w-3 h-3" />
                                        <a href={`mailto:${msg.email}`} className="hover:underline">{msg.email}</a>
                                    </div>

                                    <p className={`text-sm mt-4 leading-relaxed p-4 rounded-xl bg-black/20 border border-white/5 ${msg.read ? 'text-foreground-muted' : 'text-foreground'}`}>
                                        {msg.message}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => toggleReadStatus(msg.id, msg.read)}
                                        className={`p-2 rounded-lg border transition-colors ${msg.read
                                            ? 'border-white/10 text-foreground-muted hover:text-white hover:bg-white/5'
                                            : 'border-accent-green/20 text-accent-green bg-accent-green/10 hover:bg-accent-green/20'
                                            }`}
                                        title={msg.read ? 'Marcar como não lida' : 'Marcar como lida'}
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => deleteMessage(msg.id)}
                                        className="p-2 rounded-lg border border-white/10 text-foreground-muted hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/10 transition-colors"
                                        title="Excluir mensagem"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
