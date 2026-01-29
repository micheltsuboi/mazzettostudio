'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Pencil, Trash2, Loader2, Briefcase } from 'lucide-react'
import JobForm from '@/components/admin/JobForm'
import TimeTracker from '@/components/admin/TimeTracker'
import { formatCurrency } from '@/lib/utils'
import { Database } from '@/types/database.types'

type Job = Database['public']['Tables']['jobs']['Row'] & {
    cliente: { razao_social: string } | null
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingJob, setEditingJob] = useState<Job | undefined>(undefined)

    const supabase = createClient()

    const fetchJobs = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('jobs')
                .select('*, cliente:clientes(razao_social)')
                .order('created_at', { ascending: false })

            if (error) throw error
            setJobs(data as Job[])
        } catch (error) {
            console.error('Erro ao buscar jobs:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchJobs()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este job? Isso excluirá também todo o histórico de tempo.')) return

        try {
            const { error } = await (supabase
                .from('jobs') as any)
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchJobs()
        } catch (error) {
            console.error('Erro ao excluir job:', error)
            alert('Erro ao excluir job')
        }
    }

    const handleEdit = (job: Job) => {
        setEditingJob(job)
        setIsFormOpen(true)
    }

    const handleNew = () => {
        setEditingJob(undefined)
        setIsFormOpen(true)
    }

    const handleFormSuccess = () => {
        setIsFormOpen(false)
        fetchJobs()
    }

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            // Optimistic update
            setJobs(jobs.map(j => j.id === id ? { ...j, status: newStatus } : j))

            const { error } = await (supabase
                .from('jobs') as any)
                .update({ status: newStatus })
                .eq('id', id)

            if (error) throw error
        } catch (error) {
            console.error('Erro ao atualizar status:', error)
            alert('Erro ao atualizar status')
            fetchJobs() // Revert on error
        }
    }

    const handlePaymentStatusUpdate = async (id: string, newStatus: string, jobTitle: string, jobValue: number) => {
        try {
            // Optimistic update
            setJobs(jobs.map(j => j.id === id ? { ...j, status_pagamento: newStatus } as any : j))

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuário não autenticado')

            // 1. Update Job
            const { error: jobError } = await (supabase
                .from('jobs') as any)
                .update({ status_pagamento: newStatus })
                .eq('id', id)

            if (jobError) throw jobError

            // 2. Sync Financeiro
            const { data: existingFinanceiro } = await supabase
                .from('financeiro')
                .select('id')
                .eq('job_id', id)
                .single() as any

            const financeiroStatus = newStatus === 'pago' ? 'pago' : 'a_receber'

            if (existingFinanceiro) {
                await (supabase
                    .from('financeiro') as any)
                    .update({ status: financeiroStatus })
                    .eq('id', existingFinanceiro.id)
            } else {
                await (supabase
                    .from('financeiro') as any)
                    .insert({
                        job_id: id,
                        descricao: `Job: ${jobTitle}`,
                        valor: jobValue,
                        tipo: 'entrada',
                        status: financeiroStatus,
                        user_id: user.id
                    })
            }

        } catch (error) {
            console.error('Erro ao atualizar status pagamento:', error)
            alert('Erro ao atualizar status pagamento')
            fetchJobs() // Revert
        }
    }

    const filteredJobs = jobs.filter(job =>
        job.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.cliente?.razao_social.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-accent-blue animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Jobs</h1>
                    <p className="text-foreground-muted">Gerencie projetos e controle o tempo</p>
                </div>
                <button
                    onClick={handleNew}
                    className="flex items-center gap-2 px-4 py-2 bg-[image:var(--gradient-glow)] text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 font-bold"
                >
                    <Plus className="w-5 h-5" />
                    Novo Job
                </button>
            </div>

            {/* Busca */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <input
                    type="text"
                    placeholder="Buscar por título ou cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-surface-highlight border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all text-foreground placeholder:text-foreground-muted"
                />
            </div>

            {/* Lista */}
            <div className="flex flex-col gap-4">
                {/* Header (Desktop Only) */}
                <div className="hidden md:flex px-6 items-center justify-between text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                    <div className="flex-1 pl-1">Job / Cliente</div>
                    <div className="flex items-center gap-5 w-auto">
                        <div className="w-[100px] text-center">Tempo</div>
                        <div className="min-w-[80px] text-right">Valor</div>
                        <div className="w-[110px] pl-1">Pagamento</div>
                        <div className="w-[120px] pl-1">Progresso</div>
                        <div className="w-[70px] text-right pr-2">Ações</div>
                    </div>
                </div>

                {filteredJobs.map((job) => (
                    <div key={job.id} className="glass-card rounded-2xl p-6 md:p-4 md:px-6 transition-all hover:border-white/20 group">

                        {/* Container Flex: Coluna no Mobile, Linha no Desktop */}
                        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-4 md:justify-between">

                            {/* Esquerda: Informações Principais (Título e Cliente) */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                                    <h3 className="font-bold text-white text-lg truncate min-w-[200px] max-w-[300px]" title={job.titulo}>
                                        {job.titulo}
                                    </h3>
                                    {job.cliente && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-foreground-muted w-fit shrink-0">
                                            <Briefcase className="w-3 h-3" />
                                            <span className="truncate max-w-[150px]">{job.cliente.razao_social}</span>
                                        </div>
                                    )}
                                </div>
                                {job.observacoes && (
                                    <p className="text-sm text-foreground-muted/60 truncate mt-1 md:mt-0 font-medium md:hidden">
                                        {job.observacoes}
                                    </p>
                                )}
                            </div>

                            {/* Direita: Controles Compactos na Linha */}
                            <div className="grid grid-cols-2 md:flex md:items-center md:gap-5 w-full md:w-auto">

                                {/* Time Tracker */}
                                <div className="col-span-2 md:col-span-1 md:w-auto flex flex-col md:block">
                                    <span className="md:hidden text-[10px] text-foreground-muted uppercase font-bold mb-1">Time Tracking</span>
                                    <div className="transform scale-100 md:scale-90 origin-right">
                                        <TimeTracker
                                            jobId={job.id}
                                            initialTempoTotal={job.tempo_total || 0}
                                        />
                                    </div>
                                </div>

                                {/* Valor */}
                                <div className="flex flex-col md:block min-w-[80px] text-left md:text-right">
                                    <span className="md:hidden text-[10px] text-foreground-muted uppercase font-bold mb-1">Valor</span>
                                    <p className="text-lg md:text-sm font-black text-white whitespace-nowrap">
                                        {formatCurrency(job.valor || 0)}
                                    </p>
                                </div>

                                {/* Status Pagamento */}
                                <div className="flex flex-col md:block relative">
                                    <span className="md:hidden text-[10px] text-foreground-muted uppercase font-bold mb-1">Pagamento</span>
                                    <select
                                        value={(job as any).status_pagamento || 'pendente'}
                                        onChange={(e) => handlePaymentStatusUpdate(job.id, e.target.value, job.titulo, job.valor || 0)}
                                        className={`w-full md:w-[110px] appearance-none text-xs font-bold rounded-lg pl-3 pr-2 py-2 md:py-1.5 focus:outline-none focus:ring-1 focus:ring-accent-blue transition-all cursor-pointer border
                                            ${(job as any).status_pagamento === 'pago'
                                                ? 'bg-accent-green/10 text-accent-green border-accent-green/20 hover:bg-accent-green/20'
                                                : 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20 hover:bg-accent-yellow/20'}
                                        `}
                                    >
                                        <option value="pendente">Pendente</option>
                                        <option value="pago">Pago</option>
                                    </select>
                                </div>

                                {/* Status Job */}
                                <div className="flex flex-col md:block relative">
                                    <span className="md:hidden text-[10px] text-foreground-muted uppercase font-bold mb-1">Status</span>
                                    <select
                                        value={job.status}
                                        onChange={(e) => handleStatusUpdate(job.id, e.target.value)}
                                        className={`w-full md:w-[120px] appearance-none text-xs font-bold rounded-lg pl-3 pr-2 py-2 md:py-1.5 focus:outline-none focus:ring-1 focus:ring-accent-blue transition-all cursor-pointer border
                                            ${job.status === 'concluido' ? 'bg-accent-green/10 text-accent-green border-accent-green/20 hover:bg-accent-green/20' :
                                                job.status === 'cancelado' ? 'bg-accent-red/10 text-accent-red border-accent-red/20 hover:bg-accent-red/20' :
                                                    'bg-accent-blue/10 text-accent-blue border-accent-blue/20 hover:bg-accent-blue/20'}
                                        `}
                                    >
                                        <option value="pendente">Pendente</option>
                                        <option value="em_andamento">Andamento</option>
                                        <option value="concluido">Concluído</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </div>

                                {/* Ações */}
                                <div className="col-span-2 md:col-span-1 flex justify-end gap-1 md:pl-2 opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(job)}
                                        className="p-1.5 text-foreground-muted hover:text-accent-blue bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5 hover:border-white/20"
                                        title="Editar"
                                    >
                                        <Pencil className="w-4 h-4 md:w-3.5 md:h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(job.id)}
                                        className="p-1.5 text-foreground-muted hover:text-accent-red bg-white/5 hover:bg-accent-red/10 rounded-lg transition-all border border-white/5 hover:border-accent-red/20"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredJobs.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mx-auto mb-4 text-foreground-muted">
                            <Briefcase className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-foreground font-medium text-lg">Nenhum job encontrado</p>
                        <p className="text-foreground-muted mt-1">Tente buscar por outro termo</p>
                    </div>
                )}
            </div>

            {isFormOpen && (
                <JobForm
                    job={editingJob}
                    onSuccess={handleFormSuccess}
                    onCancel={() => setIsFormOpen(false)}
                />
            )}
        </div>
    )
}
