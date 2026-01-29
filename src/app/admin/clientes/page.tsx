'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Pencil, Trash2, MapPin, Loader2, Users } from 'lucide-react'
import ClienteForm from '@/components/admin/ClienteForm'
import { Database } from '@/types/database.types'

type Cliente = Database['public']['Tables']['clientes']['Row']

export default function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingCliente, setEditingCliente] = useState<Cliente | undefined>(undefined)

    const supabase = createClient()

    const fetchClientes = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('clientes')
                .select('*')
                .order('razao_social')

            if (error) throw error
            setClientes(data || [])
        } catch (error) {
            console.error('Erro ao buscar clientes:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClientes()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return

        try {
            const { error } = await supabase
                .from('clientes')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchClientes()
        } catch (error) {
            console.error('Erro ao excluir cliente:', error)
            alert('Erro ao excluir cliente')
        }
    }

    const handleEdit = (cliente: Cliente) => {
        setEditingCliente(cliente)
        setIsFormOpen(true)
    }

    const handleNew = () => {
        setEditingCliente(undefined)
        setIsFormOpen(true)
    }

    const handleFormSuccess = () => {
        setIsFormOpen(false)
        fetchClientes()
    }

    const filteredClientes = clientes.filter(cliente =>
        cliente.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.responsavel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cnpj?.includes(searchTerm)
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
                    <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
                    <p className="text-foreground-muted mt-1">Gerencie sua base de clientes</p>
                </div>
                <button
                    onClick={handleNew}
                    className="flex items-center gap-2 px-4 py-2 bg-[image:var(--gradient-glow)] text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 font-bold"
                >
                    <Plus className="w-5 h-5" />
                    Novo Cliente
                </button>
            </div>

            {/* Busca */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <input
                    type="text"
                    placeholder="Buscar por razão social, responsável ou CNPJ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-surface-highlight border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all text-foreground placeholder:text-foreground-muted"
                />
            </div>

            {/* Lista: Flex Column agora */}
            <div className="flex flex-col gap-4">
                {filteredClientes.map((cliente) => (
                    <div key={cliente.id} className="glass-card rounded-2xl p-6 md:p-4 md:px-6 transition-all hover:border-white/20 group">

                        {/* Wrapper responsivo: Coluna no Mobile / Linha no Desktop */}
                        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-4 md:justify-between">

                            {/* Bloco 1: Nome e Responsável (Esquerda) */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                    <h3 className="font-bold text-white text-lg tracking-tight truncate min-w-[200px]">
                                        {cliente.razao_social}
                                    </h3>
                                    {cliente.responsavel && (
                                        <p className="text-sm text-foreground-muted flex items-center gap-1.5 shrink-0">
                                            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue/50" />
                                            {cliente.responsavel}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Bloco 2: Informações Secundárias e Ações (Direita/Centro) */}
                            <div className="grid grid-cols-2 md:flex md:items-center gap-4 md:gap-6 w-full md:w-auto">

                                {/* CNPJ */}
                                {cliente.cnpj && (
                                    <div className="flex flex-col md:flex-row md:items-center gap-1">
                                        <span className="md:hidden text-[10px] uppercase font-bold text-foreground-muted tracking-wider mb-1">CNPJ</span>
                                        <div className="flex items-center justify-between p-2.5 md:p-1.5 bg-white/5 md:bg-transparent rounded-lg border border-white/5 md:border-0">
                                            <span className="font-mono text-xs md:text-sm text-white tracking-wide opacity-80">{cliente.cnpj}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Contato */}
                                {(cliente.email || cliente.telefone) && (
                                    <div className="flex flex-col md:flex-row md:items-center col-span-2 md:col-span-1 gap-2 md:gap-4">
                                        {cliente.email && (
                                            <div className="flex items-center gap-2 text-xs text-foreground-muted font-medium">
                                                <span className="text-accent-blue truncate max-w-[150px]" title={cliente.email}>
                                                    {cliente.email}
                                                </span>
                                            </div>
                                        )}
                                        {cliente.telefone && (
                                            <div className="flex items-center gap-2 text-xs text-foreground-muted font-medium">
                                                <span className="text-foreground-muted/70">{cliente.telefone}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Localização */}
                                {cliente.cidade && (
                                    <div className="flex flex-col md:flex-row md:items-center col-span-2 md:col-span-1">
                                        <div className="flex items-center gap-2 text-xs text-foreground-muted font-medium uppercase tracking-wide">
                                            <MapPin className="w-3.5 h-3.5 text-accent-purple" />
                                            <span>
                                                {cliente.cidade}
                                                {cliente.estado && `, ${cliente.estado}`}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Ações */}
                                <div className="col-span-2 md:col-span-1 flex justify-end gap-1 md:border-l border-white/5 md:pl-4 border-t md:border-t-0 pt-4 md:pt-0 opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(cliente)}
                                        className="p-2 text-foreground-muted hover:text-accent-blue bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5 hover:border-white/20"
                                        title="Editar"
                                    >
                                        <Pencil className="w-4 h-4 md:w-3.5 md:h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cliente.id)}
                                        className="p-2 text-foreground-muted hover:text-accent-red bg-white/5 hover:bg-accent-red/10 rounded-lg transition-all border border-white/5 hover:border-accent-red/20"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredClientes.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mx-auto mb-4 text-foreground-muted">
                            <Users className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-foreground font-medium text-lg">Nenhum cliente encontrado</p>
                    </div>
                )}
            </div>

            {isFormOpen && (
                <ClienteForm
                    cliente={editingCliente}
                    onSuccess={handleFormSuccess}
                    onCancel={() => setIsFormOpen(false)}
                />
            )}
        </div>
    )
}
