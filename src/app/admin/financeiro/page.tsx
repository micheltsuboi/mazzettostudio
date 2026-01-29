'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Pencil, Trash2, ArrowUpCircle, ArrowDownCircle, Filter, Loader2 } from 'lucide-react'
import FinanceiroForm from '@/components/admin/FinanceiroForm'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Database } from '@/types/database.types'

type Financeiro = Database['public']['Tables']['financeiro']['Row']

export default function FinanceiroPage() {
    const [transacoes, setTransacoes] = useState<Financeiro[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState<'todos' | 'entrada' | 'saida'>('todos')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingTransacao, setEditingTransacao] = useState<Financeiro | undefined>(undefined)

    const supabase = createClient()

    const fetchTransacoes = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('financeiro')
                .select('*')
                .order('data_vencimento', { ascending: false })

            if (error) throw error
            setTransacoes(data || [])
        } catch (error) {
            console.error('Erro ao buscar transações:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTransacoes()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta transação?')) return

        try {
            const { error } = await supabase
                .from('financeiro')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchTransacoes()
        } catch (error) {
            console.error('Erro ao excluir transação:', error)
            alert('Erro ao excluir transação')
        }
    }

    const handleEdit = (transacao: Financeiro) => {
        setEditingTransacao(transacao)
        setIsFormOpen(true)
    }

    const handleNew = () => {
        setEditingTransacao(undefined)
        setIsFormOpen(true)
    }

    const handleFormSuccess = () => {
        setIsFormOpen(false)
        fetchTransacoes()
    }

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            // Optimistic update
            setTransacoes(transacoes.map(t => t.id === id ? { ...t, status: newStatus as any } : t))

            const { error } = await (supabase
                .from('financeiro') as any)
                .update({ status: newStatus })
                .eq('id', id)

            if (error) throw error

            // Se tiver um job_id vinculado, atualizaria o job também?
            // Por enquanto vamos focar em garantir que o financeiro atualize.
        } catch (error) {
            console.error('Erro ao atualizar status:', error)
            alert('Erro ao atualizar status')
            fetchTransacoes() // Revert on error
        }
    }

    const filteredTransacoes = transacoes.filter(t => {
        const matchesSearch = t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = typeFilter === 'todos' || t.tipo === typeFilter
        return matchesSearch && matchesType
    })

    const totalEntradas = filteredTransacoes
        .filter(t => t.tipo === 'entrada' && t.status === 'pago')
        .reduce((acc, t) => acc + Number(t.valor), 0)

    const totalSaidas = filteredTransacoes
        .filter(t => t.tipo === 'saida' && t.status === 'pago')
        .reduce((acc, t) => acc + Number(t.valor), 0)

    // Opcional: Calcular Previsões se quisermos mostrar "A Receber" separado
    // mas o card atual é "Entradas" (geralmente interpretado como Caixa/Recebido)

    const saldo = totalEntradas - totalSaidas

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
                    <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
                    <p className="text-foreground-muted mt-1">Controle de entradas e saídas</p>
                </div>
                <button
                    onClick={handleNew}
                    className="flex items-center gap-2 px-4 py-2 bg-[image:var(--gradient-glow)] text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 font-bold"
                >
                    <Plus className="w-5 h-5" />
                    Nova Transação
                </button>
            </div>

            {/* Resumo do filtro atual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <ArrowUpCircle className="w-10 h-10 text-accent-green" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <p className="text-sm text-foreground-muted font-bold uppercase tracking-wider relative z-10">Entradas</p>
                    <p className="text-3xl font-black text-white mt-1 relative z-10 drop-shadow-md">{formatCurrency(totalEntradas)}</p>
                </div>

                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <ArrowDownCircle className="w-10 h-10 text-accent-red" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <p className="text-sm text-foreground-muted font-bold uppercase tracking-wider relative z-10">Saídas</p>
                    <p className="text-3xl font-black text-white mt-1 relative z-10 drop-shadow-md">{formatCurrency(totalSaidas)}</p>
                </div>

                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <Filter className="w-10 h-10 text-accent-blue" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <p className="text-sm text-foreground-muted font-bold uppercase tracking-wider relative z-10">Saldo</p>
                    <p className={`text-3xl font-black mt-1 relative z-10 drop-shadow-md ${saldo >= 0 ? 'text-accent-blue' : 'text-accent-orange'}`}>
                        {formatCurrency(saldo)}
                    </p>
                </div>
            </div>

            {/* Filtros e Busca */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <input
                        type="text"
                        placeholder="Buscar por descrição ou categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all text-foreground placeholder:text-foreground-muted backdrop-blur-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTypeFilter('todos')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${typeFilter === 'todos'
                            ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                            : 'text-foreground-muted hover:bg-white/5 hover:text-white border border-transparent'
                            }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setTypeFilter('entrada')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${typeFilter === 'entrada'
                            ? 'bg-accent-green/20 text-accent-green border border-accent-green/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'text-foreground-muted hover:bg-accent-green/10 hover:text-accent-green border border-transparent'
                            }`}
                    >
                        Entradas
                    </button>
                    <button
                        onClick={() => setTypeFilter('saida')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${typeFilter === 'saida'
                            ? 'bg-accent-red/20 text-accent-red border border-accent-red/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                            : 'text-foreground-muted hover:bg-accent-red/10 hover:text-accent-red border border-transparent'
                            }`}
                    >
                        Saídas
                    </button>
                </div>
            </div>

            {/* Tabela */}
            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Descrição</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Categoria</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Vencimento</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredTransacoes.map((t) => (
                                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${t.tipo === 'entrada' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>
                                                {t.tipo === 'entrada' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                                            </div>
                                            <span className="font-bold text-white text-sm">{t.descricao}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-muted font-medium">
                                        {t.categoria || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-muted font-medium">
                                        {t.data_vencimento ? formatDate(t.data_vencimento) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="relative">
                                            <select
                                                value={t.status}
                                                onChange={(e) => handleStatusUpdate(t.id, e.target.value)}
                                                className={`appearance-none px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent-blue/50 transition-all ${t.status === 'pago'
                                                    ? 'bg-accent-green/10 text-accent-green border-accent-green/20 hover:bg-accent-green/20'
                                                    : 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20 hover:bg-accent-yellow/20'
                                                    }`}
                                            >
                                                <option className="bg-background text-foreground" value={t.tipo === 'entrada' ? 'a_receber' : 'a_pagar'}>
                                                    {t.tipo === 'entrada' ? 'A Receber' : 'A Pagar'}
                                                </option>
                                                <option className="bg-background text-foreground" value="pago">
                                                    Pago
                                                </option>
                                            </select>
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-black text-right tracking-tight ${t.tipo === 'entrada' ? 'text-accent-green' : 'text-accent-red'
                                        }`}>
                                        {t.tipo === 'saida' && '- '}{formatCurrency(t.valor)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-1 opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(t)}
                                                className="text-foreground-muted hover:text-accent-blue p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5 hover:border-white/20"
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="text-foreground-muted hover:text-accent-red p-2 bg-white/5 hover:bg-accent-red/10 rounded-lg transition-all border border-white/5 hover:border-accent-red/20"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredTransacoes.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-foreground-muted">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                                            <Filter className="w-8 h-8" />
                                        </div>
                                        <p className="text-lg font-medium">Nenhuma transação encontrada</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isFormOpen && (
                <FinanceiroForm
                    transacao={editingTransacao}
                    onSuccess={handleFormSuccess}
                    onCancel={() => setIsFormOpen(false)}
                />
            )}
        </div>
    )
}
