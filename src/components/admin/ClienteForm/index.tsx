'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Loader2 } from 'lucide-react'
import { Database } from '@/types/database.types'

type Cliente = Database['public']['Tables']['clientes']['Row']

interface ClienteFormProps {
    cliente?: Cliente
    onSuccess: () => void
    onCancel: () => void
}

export default function ClienteForm({ cliente, onSuccess, onCancel }: ClienteFormProps) {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        razao_social: cliente?.razao_social || '',
        cnpj: cliente?.cnpj || '',
        responsavel: cliente?.responsavel || '',
        cpf: cliente?.cpf || '',
        data_nascimento: cliente?.data_nascimento || '',
        endereco: cliente?.endereco || '',
        cidade: cliente?.cidade || '',
        estado: cliente?.estado || '',
        email: cliente?.email || '',
        telefone: cliente?.telefone || '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error('Usuário não autenticado')

            const dataToSave: any = {
                ...formData,
                user_id: user.id
            }

            const { error: dbError } = cliente
                ? await (supabase.from('clientes') as any)
                    .update(dataToSave)
                    .eq('id', cliente.id)
                : await (supabase.from('clientes') as any)
                    .insert(dataToSave)

            if (dbError) throw dbError

            onSuccess()
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar cliente')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#0f172a]/95 backdrop-blur-md z-10">
                    <h2 className="text-xl font-bold text-white">
                        {cliente ? 'Editar Cliente' : 'Novo Cliente'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-2 text-foreground-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-accent-red/10 text-accent-red p-4 rounded-xl text-sm border border-accent-red/20 font-medium">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground-muted uppercase tracking-wider">Razão Social *</label>
                            <input
                                required
                                type="text"
                                value={formData.razao_social}
                                onChange={e => setFormData({ ...formData, razao_social: e.target.value })}
                                className="w-full px-4 py-3 bg-surface-highlight border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all placeholder:text-foreground-muted/50"
                                placeholder="Nome da empresa"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground-muted uppercase tracking-wider">CNPJ</label>
                            <input
                                type="text"
                                value={formData.cnpj}
                                onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                                className="w-full px-4 py-3 bg-surface-highlight border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all placeholder:text-foreground-muted/50"
                                placeholder="00.000.000/0000-00"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground-muted uppercase tracking-wider">Responsável</label>
                            <input
                                type="text"
                                value={formData.responsavel}
                                onChange={e => setFormData({ ...formData, responsavel: e.target.value })}
                                className="w-full px-4 py-3 bg-surface-highlight border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all placeholder:text-foreground-muted/50"
                                placeholder="Nome do contato"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground-muted uppercase tracking-wider">CPF</label>
                            <input
                                type="text"
                                value={formData.cpf}
                                onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                                className="w-full px-4 py-3 bg-surface-highlight border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all placeholder:text-foreground-muted/50"
                                placeholder="000.000.000-00"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground-muted uppercase tracking-wider">Data de Nascimento</label>
                            <input
                                type="date"
                                value={formData.data_nascimento}
                                onChange={e => setFormData({ ...formData, data_nascimento: e.target.value })}
                                className="w-full px-4 py-3 bg-surface-highlight border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all placeholder:text-foreground-muted/50 [color-scheme:dark]"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-bold text-foreground-muted uppercase tracking-wider">Endereço</label>
                            <input
                                type="text"
                                value={formData.endereco}
                                onChange={e => setFormData({ ...formData, endereco: e.target.value })}
                                className="w-full px-4 py-3 bg-surface-highlight border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all placeholder:text-foreground-muted/50"
                                placeholder="Rua, número, bairro..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground-muted uppercase tracking-wider">Cidade</label>
                            <input
                                type="text"
                                value={formData.cidade}
                                onChange={e => setFormData({ ...formData, cidade: e.target.value })}
                                className="w-full px-4 py-3 bg-surface-highlight border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all placeholder:text-foreground-muted/50"
                                placeholder="Cidade"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground-muted uppercase tracking-wider">Estado (UF)</label>
                            <input
                                type="text"
                                maxLength={2}
                                value={formData.estado}
                                onChange={e => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                                className="w-full px-4 py-3 bg-surface-highlight border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all placeholder:text-foreground-muted/50"
                                placeholder="EX"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground-muted uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-surface-highlight border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all placeholder:text-foreground-muted/50"
                                placeholder="cliente@email.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground-muted uppercase tracking-wider">Telefone</label>
                            <input
                                type="tel"
                                value={formData.telefone}
                                onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                                className="w-full px-4 py-3 bg-surface-highlight border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all placeholder:text-foreground-muted/50"
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2.5 text-foreground-muted hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[image:var(--gradient-glow)] text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {cliente ? 'Salvar Alterações' : 'Criar Cliente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
