'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Loader2 } from 'lucide-react'
import { Database } from '@/types/database.types'

type Job = Database['public']['Tables']['jobs']['Row']
type Cliente = Database['public']['Tables']['clientes']['Row']

interface JobFormProps {
    job?: Job
    onSuccess: () => void
    onCancel: () => void
}

export default function JobForm({ job, onSuccess, onCancel }: JobFormProps) {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        titulo: job?.titulo || '',
        cliente_id: job?.cliente_id || '',
        valor: job?.valor || '',
        observacoes: job?.observacoes || '',
        status: job?.status || 'em_andamento',
        status_pagamento: (job as any)?.status_pagamento || 'pendente',
    })

    useEffect(() => {
        const fetchClientes = async () => {
            const { data } = await supabase
                .from('clientes')
                .select('id, razao_social')
                .order('razao_social')

            if (data) setClientes(data)
        }
        fetchClientes()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuário não autenticado')

            const valorNumerico = formData.valor ? Number(formData.valor) : 0

            const dataToSave: any = {
                ...formData,
                valor: valorNumerico,
                user_id: user.id
            }

            let jobId = job?.id

            // 1. Salvar ou Atualizar Job
            if (job) {
                const { error: dbError } = await (supabase
                    .from('jobs') as any)
                    .update(dataToSave)
                    .eq('id', job.id)
                if (dbError) throw dbError
            } else {
                const { data: newJob, error: dbError } = await (supabase
                    .from('jobs') as any)
                    .insert(dataToSave)
                    .select()
                    .single()

                if (dbError) throw dbError
                jobId = newJob.id
            }

            // 2. Sincronizar com Financeiro
            if (jobId) {
                // Verificar se já existe registro financeiro para este job
                const { data: existingFinanceiro } = await supabase
                    .from('financeiro')
                    .select('id')
                    .eq('job_id', jobId)
                    .single() as any

                const financeiroStatus = formData.status_pagamento === 'pago' ? 'pago' : 'a_receber'
                const financeiroData = {
                    job_id: jobId,
                    descricao: `Job: ${formData.titulo}`,
                    valor: valorNumerico,
                    tipo: 'entrada',
                    status: financeiroStatus,
                    data_vencimento: new Date().toISOString(), // Default para hoje
                    user_id: user.id
                }

                if (existingFinanceiro) {
                    await (supabase
                        .from('financeiro') as any)
                        .update({
                            valor: valorNumerico,
                            status: financeiroStatus,
                            descricao: `Job: ${formData.titulo}`
                        })
                        .eq('id', (existingFinanceiro as any).id)
                } else {
                    await (supabase
                        .from('financeiro') as any)
                        .insert(financeiroData)
                }
            }

            onSuccess()
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Erro ao salvar job')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10">
                <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-surface z-10">
                    <h2 className="text-xl font-bold text-foreground">
                        {job ? 'Editar Job' : 'Novo Job'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-surface-highlight rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-foreground-muted" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg text-sm border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground-muted">Título do Job *</label>
                            <input
                                required
                                type="text"
                                value={formData.titulo}
                                onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                className="w-full px-3 py-2 bg-surface-highlight border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground placeholder:text-foreground-muted/50"
                                placeholder="Ex: Redesign Landing Page"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground-muted">Cliente</label>
                                <select
                                    value={formData.cliente_id}
                                    onChange={e => setFormData({ ...formData, cliente_id: e.target.value })}
                                    className="w-full px-3 py-2 bg-surface-highlight border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground"
                                >
                                    <option value="">Selecione um cliente...</option>
                                    {clientes.map(cliente => (
                                        <option key={cliente.id} value={cliente.id}>
                                            {cliente.razao_social}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground-muted">Valor (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.valor}
                                    onChange={e => setFormData({ ...formData, valor: e.target.value })}
                                    className="w-full px-3 py-2 bg-surface-highlight border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground placeholder:text-foreground-muted/50"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground-muted">Status do Projeto</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 bg-surface-highlight border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground"
                                >
                                    <option value="pendente">Pendente</option>
                                    <option value="em_andamento">Em Andamento</option>
                                    <option value="concluido">Concluído</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground-muted">Status do Pagamento</label>
                                <select
                                    value={formData.status_pagamento}
                                    onChange={e => setFormData({ ...formData, status_pagamento: e.target.value })}
                                    className="w-full px-3 py-2 bg-surface-highlight border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground"
                                >
                                    <option value="pendente">Pendente</option>
                                    <option value="pago">Pago</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground-muted">Observações</label>
                            <textarea
                                rows={4}
                                value={formData.observacoes}
                                onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                                className="w-full px-3 py-2 bg-surface-highlight border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground placeholder:text-foreground-muted/50 resize-none"
                                placeholder="Detalhes adicionais sobre o job..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-foreground-muted hover:bg-surface-highlight rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-[image:var(--gradient-glow)] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-purple-500/20 font-bold"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {job ? 'Salvar Alterações' : 'Criar Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
