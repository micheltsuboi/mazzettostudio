import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import DashboardContent from '@/components/admin/Dashboard'

import { Database } from '@/types/database.types'

type Financeiro = Database['public']['Tables']['financeiro']['Row']
type Job = Database['public']['Tables']['jobs']['Row']

export const metadata: Metadata = {
    title: 'Dashboard | Mazzetto Studio',
    description: 'Painel administrativo',
}

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Buscar dados para o dashboard
    const [clientesData, jobsData, financeiroData] = await Promise.all([
        supabase.from('clientes').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('*').eq('user_id', user.id),
        supabase.from('financeiro').select('*').eq('user_id', user.id),
    ])

    const financeiro = (financeiroData.data || []) as unknown as Financeiro[]
    const jobs = (jobsData.data || []) as unknown as Job[]

    const totalClientes = clientesData.count || 0
    const totalJobs = jobs.length || 0

    const entradas = financeiro
        .filter(f => f.tipo === 'entrada' && f.status === 'pago')
        .reduce((sum, f) => sum + Number(f.valor), 0) || 0

    const saidas = financeiro
        .filter(f => f.tipo === 'saida')
        .reduce((sum, f) => sum + Number(f.valor), 0) || 0

    const aReceber = financeiro
        .filter(f => f.tipo === 'entrada' && f.status === 'a_receber')
        .reduce((sum, f) => sum + Number(f.valor), 0) || 0

    const tempoTotal = jobs
        .reduce((sum, job) => sum + (job.tempo_total || 0), 0) || 0

    return (
        <DashboardContent
            stats={{
                totalClientes,
                totalJobs,
                entradas,
                saidas,
                aReceber,
                tempoTotal
            }}
            recentJobs={jobs.slice(0, 5) || []}
            financeiroData={financeiro}
        />
    )
}
