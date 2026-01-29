'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Loader2 } from 'lucide-react'
import { Database } from '@/types/database.types'

type Financeiro = Database['public']['Tables']['financeiro']['Row']
type Job = Database['public']['Tables']['jobs']['Row']

interface FinanceiroFormProps {
    transacao?: Financeiro
    onSuccess: () => void
    onCancel: () => void
}

export default function FinanceiroForm({ transacao, onSuccess, onCancel }: FinanceiroFormProps) {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [jobs, setJobs] = useState<Job[]>([])
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        tipo: transacao?.tipo || 'entrada',
        descricao: transacao?.descricao || '',
        valor: transacao?.valor || '',
        job_id: transacao?.job_id || '',
        data_vencimento: transacao?.data_vencimento || '',
        data_pagamento: transacao?.data_pagamento || '',
        status: transacao?.status || 'a_receber',
        categoria: transacao?.categoria || '',
    })

    // Ajustar status inicial baseado no tipo se for novo
    useEffect(() => {
        if (!transacao) {
            if (formData.tipo === 'saida' && formData.status === 'a_receber') {
                setFormData(prev => ({ ...prev, status: 'a_pagar' }))
            } else if (formData.tipo === 'entrada' && formData.status === 'a_pagar') {
                setFormData(prev => ({ ...prev, status: 'a_receber' }))
            }
        }
    }, [formData.tipo])

    useEffect(() => {
        const fetchJobs = async () => {
            const { data } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) setJobs(data)
        }
        fetchJobs()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuário não autenticado')

            const dataToSave = {
                ...formData,
                valor: Number(formData.valor),
                job_id: formData.job_id || null, // Converter string vazia para null
                data_vencimento: formData.data_vencimento || null,
                data_pagamento: formData.data_pagamento || null,
                user_id: user.id
            }

            const { error: dbError } = transacao
                ? await (supabase.from('financeiro') as any)
                    .update(dataToSave)
                    .eq('id', transacao.id)
                : await (supabase.from('financeiro') as any)
                    .insert(dataToSave)

            if (dbError) throw dbError

            onSuccess()
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar transação')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/5">
                <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-surface z-10">
                    <h2 className="text-xl font-bold text-foreground">
                        {transacao ? 'Editar Transação' : 'Nova Transação'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-foreground-muted" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-accent-red/10 text-accent-red p-4 rounded-xl text-sm border border-accent-red/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground-muted">Tipo</label>
                                <div className="flex bg-surface-highlight rounded-xl p-1">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, tipo: 'entrada' })}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${formData.tipo === 'entrada'
                                            ? 'bg-accent-green/20 text-accent-green shadow-sm'
                                            : 'text-foreground-muted hover:text-foreground'
                                            }`}
                                    >
                                        Entrada
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, tipo: 'saida' })}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${formData.tipo === 'saida'
                                            ? 'bg-accent-red/20 text-accent-red shadow-sm'
                                            : 'text-foreground-muted hover:text-foreground'
                                            }`}
                                    >
                                        Saída
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground-muted">Valor (R$)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    value={formData.valor}
                                    onChange={e => setFormData({ ...formData, valor: e.target.value })}
                                    className="w-full px-3 py-2 bg-surface-highlight border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground placeholder:text-foreground-muted"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground-muted">Descrição *</label>
                            <input
                                required
                                type="text"
                                value={formData.descricao}
                                onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                className="w-full px-3 py-2 bg-surface-highlight border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground placeholder:text-foreground-muted"
                                placeholder="Ex: Pagamento Projeto X"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground-muted">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 bg-surface-highlight border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground"
                                >
                                    {formData.tipo === 'entrada' ? (
                                        <>
                                            <option value="a_receber">A Receber</option>
                                            <option value="pago">Pago</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="a_pagar">A Pagar</option>
                                            <option value="pago">Pago</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground-muted">Categoria</label>
                                <input
                                    type="text"
                                    value={formData.categoria}
                                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                                    className="w-full px-3 py-2 bg-surface-highlight border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground placeholder:text-foreground-muted"
                                    placeholder="Ex: Honorários, Software..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground-muted">Data Vencimento</label>
                                <input
                                    type="date"
                                    value={formData.data_vencimento}
                                    onChange={e => setFormData({ ...formData, data_vencimento: e.target.value })}
                                    className="w-full px-3 py-2 bg-surface-highlight border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground [color-scheme:dark]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground-muted">Data Pagamento</label>
                                <input
                                    type="date"
                                    value={formData.data_pagamento}
                                    onChange={e => setFormData({ ...formData, data_pagamento: e.target.value })}
                                    className="w-full px-3 py-2 bg-surface-highlight border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground-muted">Vincular Job (Opcional)</label>
                            <select
                                value={formData.job_id}
                                onChange={e => setFormData({ ...formData, job_id: e.target.value })}
                                className="w-full px-3 py-2 bg-surface-highlight border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground"
                            >
                                <option value="">Sem vínculo</option>
                                {jobs.map(job => (
                                    <option key={job.id} value={job.id}>
                                        {job.titulo}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-foreground-muted hover:bg-white/5 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-[image:var(--gradient-glow)] text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {transacao ? 'Salvar Alterações' : 'Criar Transação'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
