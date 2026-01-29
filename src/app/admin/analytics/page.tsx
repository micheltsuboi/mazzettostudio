'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts'
import { Eye, TrendingUp, MousePointerClick, Calendar } from 'lucide-react'

export default function AnalyticsPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [totalViews, setTotalViews] = useState(0)
    const [viewsLast30Days, setViewsLast30Days] = useState<any[]>([])
    const [topPages, setTopPages] = useState<any[]>([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)

            // 1. Total Views
            const { count } = await supabase
                .from('page_views')
                .select('*', { count: 'exact', head: true }) as any

            setTotalViews(count || 0)

            // 2. Views Last 30 Days (Grouped by Date)
            // Note: In a real heavy-load app, we'd use a Materialized View or Edge Function for this aggregation
            // efficiently. Here we fetch simple data and aggregate in client for simplicity on small datasets.
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const { data: recentViews } = await supabase
                .from('page_views')
                .select('created_at')
                .gte('created_at', thirtyDaysAgo.toISOString())
                .order('created_at', { ascending: true }) as any

            if (recentViews) {
                // Aggregate by day
                const dailyCounts: Record<string, number> = {}
                recentViews.forEach((view: any) => {
                    const date = new Date(view.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    dailyCounts[date] = (dailyCounts[date] || 0) + 1
                })

                // Fill missing days
                const chartData = []
                for (let i = 29; i >= 0; i--) {
                    const date = new Date()
                    date.setDate(date.getDate() - i)
                    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    chartData.push({
                        date: dateStr,
                        views: dailyCounts[dateStr] || 0
                    })
                }
                setViewsLast30Days(chartData)
            }

            // 3. Top Pages (All time)
            const { data: allViews } = await supabase
                .from('page_views')
                .select('path') as any

            if (allViews) {
                const pageCounts: Record<string, number> = {}
                allViews.forEach((view: any) => {
                    // Normalize path (remove query params for grouping)
                    const cleanPath = view.path.split('?')[0]
                    pageCounts[cleanPath] = (pageCounts[cleanPath] || 0) + 1
                })

                const topPagesData = Object.entries(pageCounts)
                    .map(([path, count]) => ({ path, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5) // Top 5

                setTopPages(topPagesData)
            }

        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 rounded-full border-2 border-accent-purple border-t-transparent animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
                <p className="text-foreground-muted">Acompanhe o tráfego do site em tempo real</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-accent-purple/10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-accent-purple/10 rounded-lg text-accent-purple">
                            <Eye className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-foreground-muted uppercase tracking-wider">Total de Acessos</span>
                    </div>
                    <p className="text-4xl font-black text-white">{totalViews}</p>
                    <p className="text-xs text-foreground-muted mt-2">Desde o início</p>
                </div>

                <div className="bg-surface border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-accent-blue/10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-accent-blue/10 rounded-lg text-accent-blue">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-foreground-muted uppercase tracking-wider">Últimos 30 Dias</span>
                    </div>
                    <p className="text-4xl font-black text-white">
                        {viewsLast30Days.reduce((acc, item) => acc + item.views, 0)}
                    </p>
                    <p className="text-xs text-foreground-muted mt-2">Visitas no período</p>
                </div>

                <div className="bg-surface border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-accent-pink/10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-accent-pink/10 rounded-lg text-accent-pink">
                            <MousePointerClick className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-foreground-muted uppercase tracking-wider">Média Diária</span>
                    </div>
                    <p className="text-4xl font-black text-white">
                        {Math.round(viewsLast30Days.reduce((acc, item) => acc + item.views, 0) / 30)}
                    </p>
                    <p className="text-xs text-foreground-muted mt-2">Visitas por dia (estimado)</p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Evolution Chart */}
                <div className="bg-surface border border-white/5 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-foreground-muted" />
                            Evolução de Acessos
                        </h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={viewsLast30Days}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Pages Chart */}
                <div className="bg-surface border border-white/5 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-white flex items-center gap-2">
                            <MousePointerClick className="w-4 h-4 text-foreground-muted" />
                            Páginas Mais Acessadas
                        </h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={topPages} margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="path"
                                    type="category"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    width={100}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#3b82f6"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
