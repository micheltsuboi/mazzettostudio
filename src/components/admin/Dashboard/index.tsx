'use client'

import { DollarSign, Users, Briefcase, Activity, TrendingUp, ArrowUpRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts'

interface DashboardStats {
    totalClientes: number
    totalJobs: number
    entradas: number
    saidas: number
    aReceber: number
    tempoTotal: number
}

interface DashboardContentProps {
    stats: DashboardStats
    recentJobs: any[]
    financeiroData: any[]
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#facc15', '#f97316']

export default function DashboardContent({ stats, recentJobs, financeiroData }: DashboardContentProps) {
    // Calcular saldo
    const saldo = stats.entradas - stats.saidas

    // Dados para o gráfico principal (Fluxo de Caixa)
    // Agrupar financeiro por mês
    const monthlyData = financeiroData.reduce((acc: any[], item: any) => {
        const date = new Date(item.data_vencimento || item.created_at)
        const monthYear = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })

        const existingMonth = acc.find((m: any) => m.name === monthYear)

        if (existingMonth) {
            if (item.tipo === 'entrada') existingMonth.entrada += Number(item.valor)
            if (item.tipo === 'saida') existingMonth.saida += Number(item.valor)
        } else {
            acc.push({
                name: monthYear,
                entrada: item.tipo === 'entrada' ? Number(item.valor) : 0,
                saida: item.tipo === 'saida' ? Number(item.valor) : 0,
                originalDate: date // para ordenação
            })
        }
        return acc
    }, []).sort((a: any, b: any) => a.originalDate - b.originalDate)

    const pieData = [
        { name: 'Entradas', value: stats.entradas },
        { name: 'A Receber', value: stats.aReceber },
        { name: 'Saídas', value: stats.saidas },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black tracking-tight text-white mb-2 drop-shadow-md">
                    Dashboard
                </h1>
                <p className="text-foreground-muted text-lg font-light">
                    Visão geral do seu estúdio
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Saldo - Destaque */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <DollarSign className="w-12 h-12 text-accent-green" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <p className="text-sm font-bold uppercase tracking-wider text-foreground-muted mb-1 relative z-10">Saldo Total</p>
                    <h3 className={`text-3xl font-black mb-4 relative z-10 drop-shadow-lg ${saldo >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                        {formatCurrency(saldo)}
                    </h3>
                    <div className="flex items-center gap-2 text-xs relative z-10">
                        <span className="px-2 py-1 rounded-full bg-accent-green/10 text-accent-green font-bold border border-accent-green/20 backdrop-blur-sm">
                            +12% mês
                        </span>
                        <span className="text-foreground-muted">vs mês anterior</span>
                    </div>
                </div>

                {/* A Receber */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <TrendingUp className="w-10 h-10 text-accent-yellow" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <p className="text-sm font-bold uppercase tracking-wider text-foreground-muted mb-1 relative z-10">A Receber</p>
                    <h3 className="text-3xl font-black text-white mb-4 relative z-10">
                        {formatCurrency(stats.aReceber)}
                    </h3>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                        <div className="h-full bg-accent-yellow shadow-[0_0_10px_rgba(250,204,21,0.5)] w-[60%]" />
                    </div>
                </div>

                {/* Jobs Ativos */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <Briefcase className="w-10 h-10 text-accent-blue" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <p className="text-sm font-bold uppercase tracking-wider text-foreground-muted mb-1 relative z-10">Jobs Ativos</p>
                    <h3 className="text-3xl font-black text-white mb-4 relative z-10">
                        {stats.totalJobs}
                    </h3>
                    <div className="flex -space-x-2 relative z-10">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-surface-highlight bg-gradient-to-br from-gray-700 to-gray-900" />
                        ))}
                    </div>
                </div>

                {/* Clientes */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <Users className="w-10 h-10 text-accent-purple" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <p className="text-sm font-bold uppercase tracking-wider text-foreground-muted mb-1 relative z-10">Total Clientes</p>
                    <h3 className="text-3xl font-black text-white mb-4 relative z-10">
                        {stats.totalClientes}
                    </h3>
                    <p className="text-xs text-foreground-muted relative z-10">Base ativa crescendo</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Graph */}
                <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-accent-blue" />
                                Fluxo Financeiro
                            </h3>
                            <p className="text-sm text-foreground-muted">Entradas vs Saídas nos últimos meses</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSaida" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `R$${value / 1000}k`}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="entrada"
                                    name="Entradas"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorEntrada)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="saida"
                                    name="Saídas"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSaida)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart Distribution */}
                <div className="glass-card rounded-2xl p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6">Distribuição</h3>
                    <div className="flex-1 min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell key="entrada" fill="#10b981" className="drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                    <Cell key="areceber" fill="#facc15" className="drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]" />
                                    <Cell key="saida" fill="#ef4444" className="drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text Overlap */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-white">{stats.totalJobs}</span>
                            <span className="text-xs text-foreground-muted uppercase tracking-wider">Jobs</span>
                        </div>
                    </div>
                    <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-accent-green shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-foreground-muted">Recebido</span>
                            </div>
                            <span className="font-bold text-white">{formatCurrency(stats.entradas)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-accent-yellow shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                                <span className="text-foreground-muted">A Receber</span>
                            </div>
                            <span className="font-bold text-white">{formatCurrency(stats.aReceber)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Jobs Table */}
            <div className="glass-card rounded-2xl overflow-hidden p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Jobs Recentes</h3>
                    <button className="text-xs font-bold text-accent-blue uppercase tracking-wider hover:text-blue-400 transition-colors flex items-center gap-1 group">
                        Ver todos <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 text-left">
                                <th className="pb-4 pl-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Projeto</th>
                                <th className="pb-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Status Projeto</th>
                                <th className="pb-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">Pagamento</th>
                                <th className="pb-4 pr-4 text-right text-xs font-bold text-foreground-muted uppercase tracking-wider">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {recentJobs.map((job) => (
                                <tr key={job.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="py-4 pl-4">
                                        <div>
                                            <p className="font-bold text-white group-hover:text-accent-blue transition-colors">{job.titulo}</p>
                                            <p className="text-xs text-foreground-muted">{job.cliente?.razao_social}</p>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold items-center gap-1.5 border ${job.status === 'concluido'
                                                ? 'bg-accent-green/10 text-accent-green border-accent-green/20'
                                                : 'bg-accent-blue/10 text-accent-blue border-accent-blue/20'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'concluido' ? 'bg-accent-green' : 'bg-accent-blue'} animate-pulse`} />
                                            {job.status === 'concluido' ? 'Entregue' : 'Em Andamento'}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${(job as any).status_pagamento === 'pago'
                                                ? 'bg-accent-green/10 text-accent-green border-accent-green/20 badge-glow-green'
                                                : 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20 badge-glow-yellow'
                                            }`}>
                                            {(job as any).status_pagamento === 'pago' ? 'Pago' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className="py-4 pr-4 text-right font-mono font-bold text-foreground-muted group-hover:text-white transition-colors">
                                        {formatCurrency(job.valor)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
