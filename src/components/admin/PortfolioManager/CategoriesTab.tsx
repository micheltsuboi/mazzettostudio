'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react'
import { Database } from '@/types/database.types'

type Categoria = Database['public']['Tables']['categorias_portfolio']['Row']

export default function CategoriesTab() {
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({ nome: '', slug: '', ordem: 0, ativo: true })

    const supabase = createClient()

    const fetchCategorias = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('categorias_portfolio')
            .select('*')
            .order('ordem')

        if (data) setCategorias(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchCategorias()
    }, [])

    const handleSave = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                alert('Erro: Usuário não autenticado.')
                return
            }

            if (!formData.nome) {
                alert('O nome da categoria é obrigatório.')
                setLoading(false)
                return
            }

            const dataToSave = { ...formData, user_id: user.id }

            let error

            if (editingId && editingId !== 'new') {
                const { error: updateError } = await (supabase.from('categorias_portfolio') as any)
                    .update(dataToSave)
                    .eq('id', editingId)
                error = updateError
            } else {
                const { error: insertError } = await (supabase.from('categorias_portfolio') as any)
                    .insert(dataToSave)
                error = insertError
            }

            if (error) throw error

            setEditingId(null)
            setFormData({ nome: '', slug: '', ordem: 0, ativo: true })
            fetchCategorias()
        } catch (error: any) {
            console.error('Erro ao salvar categoria:', error)
            alert(`Erro ao salvar categoria: ${error.message || error}`)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (cat: Categoria) => {
        setEditingId(cat.id)
        setFormData({
            nome: cat.nome,
            slug: cat.slug,
            ordem: cat.ordem || 0,
            ativo: cat.ativo || true
        })
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir categoria?')) return
        await supabase.from('categorias_portfolio').delete().eq('id', id)
        fetchCategorias()
    }

    // Slug generator simples
    const generateSlug = (text: string) => {
        return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Categorias</h3>
                <button
                    onClick={() => {
                        setEditingId('new')
                        setFormData({ nome: '', slug: '', ordem: categorias.length + 1, ativo: true })
                    }}
                    disabled={!!editingId}
                    className="flex items-center gap-2 text-sm bg-[image:var(--gradient-glow)] text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 font-bold disabled:opacity-50"
                >
                    <Plus className="w-4 h-4" />
                    Nova Categoria
                </button>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                <table className="w-full text-sm">
                    <thead className="bg-white/5 border-b border-white/5">
                        <tr>
                            <th className="px-6 py-4 text-left font-bold text-foreground-muted w-20 uppercase tracking-wider text-[10px]">Ordem</th>
                            <th className="px-6 py-4 text-left font-bold text-foreground-muted uppercase tracking-wider text-[10px]">Nome</th>
                            <th className="px-6 py-4 text-left font-bold text-foreground-muted uppercase tracking-wider text-[10px]">Slug</th>
                            <th className="px-6 py-4 text-center font-bold text-foreground-muted w-24 uppercase tracking-wider text-[10px]">Ativo</th>
                            <th className="px-6 py-4 text-right font-bold text-foreground-muted w-32 uppercase tracking-wider text-[10px]">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {editingId === 'new' && (
                            <tr className="bg-accent-blue/10">
                                <td className="p-2 px-6">
                                    <input
                                        type="number"
                                        value={formData.ordem}
                                        onChange={e => setFormData({ ...formData, ordem: e.target.valueAsNumber || 0 })}
                                        className="w-full px-2 py-1 bg-surface-highlight border border-white/10 rounded-lg text-foreground focus:ring-1 focus:ring-accent-blue"
                                        placeholder="0"
                                    />
                                </td>
                                <td className="p-2 px-6">
                                    <input
                                        type="text"
                                        value={formData.nome}
                                        onChange={e => {
                                            const nome = e.target.value
                                            setFormData({ ...formData, nome, slug: generateSlug(nome) })
                                        }}
                                        placeholder="Nome da categoria"
                                        className="w-full px-2 py-1 bg-surface-highlight border border-white/10 rounded-lg text-foreground focus:ring-1 focus:ring-accent-blue"
                                        autoFocus
                                    />
                                </td>
                                <td className="p-2 px-6">
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full px-2 py-1 bg-surface-highlight border border-white/10 rounded-lg text-foreground focus:ring-1 focus:ring-accent-blue opacity-70"
                                    />
                                </td>
                                <td className="p-2 px-6 text-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.ativo}
                                        onChange={e => setFormData({ ...formData, ativo: e.target.checked })}
                                        className="rounded border-white/10 bg-surface-highlight text-accent-blue focus:ring-accent-blue"
                                    />
                                </td>
                                <td className="p-2 px-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={handleSave} className="p-1.5 text-accent-green hover:bg-accent-green/10 rounded-lg transition-colors">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="p-1.5 text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {categorias.map(cat => (
                            <tr key={cat.id} className="hover:bg-white/5 transition-colors group">
                                {editingId === cat.id ? (
                                    <>
                                        <td className="p-2 px-6">
                                            <input
                                                type="number"
                                                value={formData.ordem}
                                                onChange={e => setFormData({ ...formData, ordem: Number(e.target.value) })}
                                                className="w-full px-2 py-1 bg-surface-highlight border border-white/10 rounded-lg text-foreground focus:ring-1 focus:ring-accent-blue"
                                            />
                                        </td>
                                        <td className="p-2 px-6">
                                            <input
                                                type="text"
                                                value={formData.nome}
                                                onChange={e => {
                                                    const nome = e.target.value
                                                    setFormData({ ...formData, nome, slug: generateSlug(nome) })
                                                }}
                                                className="w-full px-2 py-1 bg-surface-highlight border border-white/10 rounded-lg text-foreground focus:ring-1 focus:ring-accent-blue"
                                            />
                                        </td>
                                        <td className="p-2 px-6">
                                            <input
                                                type="text"
                                                value={formData.slug}
                                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                                className="w-full px-2 py-1 bg-surface-highlight border border-white/10 rounded-lg text-foreground focus:ring-1 focus:ring-accent-blue opacity-70"
                                            />
                                        </td>
                                        <td className="p-2 px-6 text-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.ativo}
                                                onChange={e => setFormData({ ...formData, ativo: e.target.checked })}
                                                className="rounded border-white/10 bg-surface-highlight text-accent-blue focus:ring-accent-blue"
                                            />
                                        </td>
                                        <td className="p-2 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={handleSave} className="p-1.5 text-accent-green hover:bg-accent-green/10 rounded-lg transition-colors">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="p-1.5 text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-6 py-4 text-foreground-muted text-xs font-bold">{cat.ordem}</td>
                                        <td className="px-6 py-4 font-bold text-foreground">{cat.nome}</td>
                                        <td className="px-6 py-4 text-foreground-muted text-xs font-mono">{cat.slug}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${cat.ativo ? 'bg-accent-green/20 text-accent-green border border-accent-green/20' : 'bg-white/5 text-foreground-muted border border-white/10'}`}>
                                                {cat.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(cat)} className="p-1.5 text-foreground-muted hover:text-accent-blue hover:bg-white/5 rounded-lg transition-all">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-foreground-muted hover:text-accent-red hover:bg-white/5 rounded-lg transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
