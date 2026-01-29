'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Play, Pause, Square, Clock } from 'lucide-react'
import { formatTime } from '@/lib/utils'

interface TimeTrackerProps {
    jobId: string
    initialTempoTotal: number
}

export default function TimeTracker({ jobId, initialTempoTotal }: TimeTrackerProps) {
    const [tempoTotal, setTempoTotal] = useState(initialTempoTotal)
    const [isRunning, setIsRunning] = useState(false)
    const [currentSessionStart, setCurrentSessionStart] = useState<Date | null>(null)
    const [loading, setLoading] = useState(false)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const supabase = createClient()

    // Verificar se já existe uma sessão aberta
    useEffect(() => {
        const checkOpenSession = async () => {
            const { data } = await supabase
                .from('time_tracking')
                .select('inicio')
                .eq('job_id', jobId)
                .is('fim', null)
                .single()

            if (data) {
                setIsRunning(true)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setCurrentSessionStart(new Date((data as any).inicio))
            }
        }

        checkOpenSession()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobId])

    // Timer effect
    useEffect(() => {
        if (isRunning && currentSessionStart) {
            intervalRef.current = setInterval(() => {
                const now = new Date()
                const sessionSeconds = Math.floor((now.getTime() - currentSessionStart.getTime()) / 1000)
                // O tempo total exibido é o inicial + sessão atual
                // Nota: Idealmente, deveria recalcular o total do banco, mas para UI fluida fazemos assim
                // Vamos apenas atualizar o contador visual da sessão atual somado ao total
                // Mas para simplificar, vamos manter um contador local que incrementa
                setTempoTotal(prev => prev + 1)
            }, 1000)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isRunning, currentSessionStart])

    const handleStart = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const now = new Date()

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('time_tracking') as any)
                .insert({
                    job_id: jobId,
                    inicio: now.toISOString(),
                    user_id: user.id
                })

            if (error) throw error

            setIsRunning(true)
            setCurrentSessionStart(now)
        } catch (error) {
            console.error('Erro ao iniciar timer:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStop = async () => {
        try {
            setLoading(true)
            const now = new Date()

            // Buscar sessão aberta
            const { data: session } = await supabase
                .from('time_tracking')
                .select('id, inicio')
                .eq('job_id', jobId)
                .is('fim', null)
                .single()

            if (!session) return

            const inicio = new Date((session as any).inicio)
            const duracao = Math.floor((now.getTime() - inicio.getTime()) / 1000)

            // Atualizar sessão
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: trackingError } = await (supabase.from('time_tracking') as any)
                .update({
                    fim: now.toISOString(),
                    duracao: duracao
                })
                .eq('id', (session as any).id)

            if (trackingError) throw trackingError

            // Atualizar total no job
            // Primeiro calculamos o novo total real do banco para garantir consistência
            const { data: logs } = await supabase
                .from('time_tracking')
                .select('duracao')
                .eq('job_id', jobId)
                .not('duracao', 'is', null)

            const realTotal = (logs as any[])?.reduce((acc, log) => acc + (log.duracao || 0), 0) || 0

            await (supabase.from('jobs') as any)
                .update({ tempo_total: realTotal })
                .eq('id', jobId)

            setTempoTotal(realTotal)
            setIsRunning(false)
            setCurrentSessionStart(null)
        } catch (error) {
            console.error('Erro ao parar timer:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <div className={`
        flex items-center gap-2 font-mono text-sm font-medium
        ${isRunning ? 'text-blue-600' : 'text-slate-600'}
      `}>
                <Clock className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} />
                {formatTime(tempoTotal)}
            </div>

            <div className="h-4 w-px bg-slate-300"></div>

            {!isRunning ? (
                <button
                    onClick={handleStart}
                    disabled={loading}
                    className="p-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50"
                    title="Iniciar Cronômetro"
                >
                    <Play className="w-4 h-4 fill-current" />
                </button>
            ) : (
                <button
                    onClick={handleStop}
                    disabled={loading}
                    className="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50"
                    title="Pausar Cronômetro"
                >
                    <Pause className="w-4 h-4 fill-current" />
                </button>
            )}
        </div>
    )
}
