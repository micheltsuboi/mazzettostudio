'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Loader2, X } from 'lucide-react'
import { Database } from '@/types/database.types'
import { compressImage } from '@/utils/imageCompression'

type Projeto = Database['public']['Tables']['projetos_portfolio']['Row'] & {
    categoria: { nome: string } | null,
    imagens: Database['public']['Tables']['imagens_portfolio']['Row'][]
}

type Categoria = Database['public']['Tables']['categorias_portfolio']['Row']

export default function ProjectsTab() {
    const [projetos, setProjetos] = useState<Projeto[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingProjeto, setEditingProjeto] = useState<Projeto | undefined>(undefined)

    const supabase = createClient()

    const fetchProjetos = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('projetos_portfolio')
            .select('*, categoria:categorias_portfolio(nome), imagens:imagens_portfolio(*)')
            .order('ordem')

        if (data) setProjetos(data)
        setLoading(false)
    }

    const fetchCategorias = async () => {
        const { data } = await supabase.from('categorias_portfolio').select('*').eq('ativo', true)
        if (data) setCategorias(data)
    }

    useEffect(() => {
        fetchProjetos()
        fetchCategorias()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir projeto?')) return
        await supabase.from('projetos_portfolio').delete().eq('id', id)
        fetchProjetos()
    }

    const handleEdit = (projeto: Projeto) => {
        setEditingProjeto(projeto)
        setIsFormOpen(true)
    }

    const handleNew = () => {
        setEditingProjeto(undefined)
        setIsFormOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Projetos</h3>
                <button
                    onClick={handleNew}
                    className="flex items-center gap-2 text-sm bg-[image:var(--gradient-glow)] text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 font-bold"
                >
                    <Plus className="w-4 h-4" />
                    Novo Projeto
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projetos.map((projeto) => (
                    <div key={projeto.id} className="glass-card rounded-2xl overflow-hidden group hover:border-white/20 transition-all">
                        <div className="relative aspect-video bg-surface-highlight">
                            {projeto.imagens && projeto.imagens.length > 0 && projeto.imagens[0].url ? (
                                <img
                                    src={projeto.imagens[0].url}
                                    alt={projeto.titulo}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-foreground-muted">
                                    <ImageIcon className="w-8 h-8 opacity-50" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(projeto)}
                                    className="p-1.5 bg-surface text-foreground rounded-lg hover:text-accent-blue hover:bg-white/10 shadow-sm border border-white/10"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(projeto.id)}
                                    className="p-1.5 bg-surface text-foreground rounded-lg hover:text-accent-red hover:bg-white/10 shadow-sm border border-white/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-bold text-foreground line-clamp-1">{projeto.titulo}</h4>
                                    <p className="text-sm text-foreground-muted">{projeto.categoria?.nome}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${projeto.publicado ? 'bg-accent-green/20 text-accent-green border border-accent-green/20' : 'bg-white/5 text-foreground-muted border border-white/10'
                                    }`}>
                                    {projeto.publicado ? 'Publicado' : 'Rascunho'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isFormOpen && (
                <ProjectForm
                    projeto={editingProjeto}
                    categorias={categorias}
                    onSuccess={() => {
                        setIsFormOpen(false)
                        fetchProjetos()
                    }}
                    onCancel={() => setIsFormOpen(false)}
                />
            )}
        </div>
    )
}

function ProjectForm({ projeto, categorias, onSuccess, onCancel }: {
    projeto?: Projeto,
    categorias: Categoria[],
    onSuccess: () => void,
    onCancel: () => void
}) {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        titulo: projeto?.titulo || '',
        descricao: projeto?.descricao || '',
        categoria_id: projeto?.categoria_id || '',
        cliente: projeto?.cliente || '',
        data_projeto: projeto?.data_projeto || '',
        ordem: projeto?.ordem || 0,
        publicado: projeto?.publicado || false
    })

    const [imagens, setImagens] = useState(projeto?.imagens || [])
    const [uploading, setUploading] = useState(false)

    const elementSlug = (text: string) => {
        return text.toLowerCase().replace(/[^a-z0-9.]/g, '-')
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        try {
            setUploading(true)
            const files = Array.from(e.target.files)

            for (const file of files) {
                // 1. No Compression (Original Quality)
                console.log('Uploading original:', file.name)
                // const compressedFile = await compressImage(file) // Removed per user request
                const compressedFile = file // Using original file
                console.log('Original size:', compressedFile.size, 'type:', compressedFile.type)

                // Check auth
                const { data: { user } } = await supabase.auth.getUser()
                console.log('Current User for upload:', user?.id)

                if (!user) {
                    alert('Erro: Usuário não autenticado no momento do upload.')
                    return
                }

                // 2. Upload to Supabase
                const fileName = `${Date.now()}-${elementSlug(file.name)}`
                const filePath = `${fileName}`
                console.log('Uploading to path:', filePath)

                const { data, error } = await supabase.storage
                    .from('portfolio')
                    .upload(filePath, compressedFile, {
                        cacheControl: '3600',
                        upsert: false
                    })

                if (error) {
                    console.error('FULL Upload Error:', error)
                    alert(`Erro DETALHADO ao fazer upload: ${JSON.stringify(error)}.`)
                    continue
                }

                // 3. Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('portfolio')
                    .getPublicUrl(filePath)

                // 4. Add to state
                setImagens(prev => [...prev, {
                    url: publicUrl,
                    ordem: prev.length,
                    id: 'temp-' + Date.now() + Math.random(),
                    titulo: null,
                    projeto_id: '',
                    user_id: '',
                    created_at: ''
                }])
            }

        } catch (error) {
            console.error('Error handling images:', error)
            alert('Erro ao processar imagens.')
        } finally {
            setUploading(false)
            // Reset input
            e.target.value = ''
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            let projetoId = projeto?.id

            const projetoData: any = {
                ...formData,
                user_id: user.id
            }

            if (projetoId) {
                await (supabase.from('projetos_portfolio') as any).update(projetoData).eq('id', projetoId)
            } else {
                const { data, error } = await (supabase.from('projetos_portfolio') as any).insert(projetoData).select().single()
                if (error) throw error
                projetoId = data.id
            }

            if (projetoId && imagens.length > 0) {
                await (supabase.from('imagens_portfolio') as any).delete().eq('projeto_id', projetoId)

                const imagensToInsert: any[] = imagens.map((img, index) => ({
                    projeto_id: projetoId,
                    url: img.url,
                    titulo: img.titulo,
                    ordem: index,
                    user_id: user.id
                }))

                await (supabase.from('imagens_portfolio') as any).insert(imagensToInsert)
            }

            onSuccess()
        } catch (error) {
            console.error(error)
            alert('Erro ao salvar projeto')
        } finally {
            setLoading(false)
        }
    }

    const removeImage = (index: number) => {
        const newImagens = [...imagens]
        newImagens.splice(index, 1)
        setImagens(newImagens)
    }

    const moveImage = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === imagens.length - 1) return

        const newImagens = [...imagens]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        const temp = newImagens[targetIndex]
        newImagens[targetIndex] = newImagens[index]
        newImagens[index] = temp

        setImagens(newImagens)
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#0f172a]/95 backdrop-blur-md z-10">
                    <h2 className="text-xl font-bold text-foreground">
                        {projeto ? 'Editar Projeto' : 'Novo Projeto'}
                    </h2>
                    <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-foreground-muted" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-bold text-foreground border-b border-white/10 pb-2 uppercase tracking-wider text-xs">Informações Básicas</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground-muted">Título *</label>
                            <input
                                required
                                type="text"
                                value={formData.titulo}
                                onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                className="w-full px-3 py-2 bg-surface-highlight border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground-muted">Categoria</label>
                                <select
                                    value={formData.categoria_id || ''}
                                    onChange={e => setFormData({ ...formData, categoria_id: e.target.value })}
                                    className="w-full px-3 py-2 bg-surface-highlight border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground"
                                >
                                    <option value="">Selecione...</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground-muted">Ordem</label>
                                <input
                                    type="number"
                                    value={formData.ordem}
                                    onChange={e => setFormData({ ...formData, ordem: Number(e.target.value) })}
                                    className="w-full px-3 py-2 bg-surface-highlight border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground-muted">Cliente (Display)</label>
                            <input
                                type="text"
                                value={formData.cliente || ''}
                                onChange={e => setFormData({ ...formData, cliente: e.target.value })}
                                className="w-full px-3 py-2 bg-surface-highlight border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground"
                                placeholder="Nome do cliente para exibição"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground-muted">Data do Projeto</label>
                            <input
                                type="date"
                                value={formData.data_projeto || ''}
                                onChange={e => setFormData({ ...formData, data_projeto: e.target.value })}
                                className="w-full px-3 py-2 bg-surface-highlight border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground [color-scheme:dark]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground-muted">Descrição</label>
                            <textarea
                                rows={4}
                                value={formData.descricao || ''}
                                onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                className="w-full px-3 py-2 bg-surface-highlight border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-foreground resize-none"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="publicado"
                                checked={formData.publicado || false}
                                onChange={e => setFormData({ ...formData, publicado: e.target.checked })}
                                className="rounded border-white/10 bg-surface-highlight text-accent-blue focus:ring-accent-blue/50"
                            />
                            <label htmlFor="publicado" className="text-sm font-medium text-foreground-muted cursor-pointer hover:text-white transition-colors">Publicar Projeto</label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-foreground border-b border-white/10 pb-2 uppercase tracking-wider text-xs">Galeria de Imagens</h3>

                        <div className="flex gap-2 items-center">
                            <label className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-white/10 rounded-xl hover:bg-white/5 transition-colors group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                    {uploading ? (
                                        <Loader2 className="w-5 h-5 text-accent-blue animate-spin" />
                                    ) : (
                                        <ImageIcon className="w-5 h-5 text-foreground-muted group-hover:text-accent-blue transition-colors" />
                                    )}
                                    <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
                                        {uploading ? 'Processando e Enviando...' : 'Clique para selecionar fotos'}
                                    </span>
                                </div>
                            </label>
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {imagens.map((img, index) => (
                                <div key={index} className="flex items-center gap-3 bg-surface-highlight p-2 rounded-xl border border-white/5 group">
                                    <div className="w-16 h-10 bg-black/50 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={img.url} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-foreground-muted truncate group-hover:text-foreground transition-colors">{img.url}</p>
                                    </div>
                                    <div className="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <button type="button" onClick={() => moveImage(index, 'up')} className="p-1 hover:bg-white/10 rounded-lg text-foreground-muted hover:text-white">
                                            <ArrowUp className="w-3 h-3" />
                                        </button>
                                        <button type="button" onClick={() => moveImage(index, 'down')} className="p-1 hover:bg-white/10 rounded-lg text-foreground-muted hover:text-white">
                                            <ArrowDown className="w-3 h-3" />
                                        </button>
                                        <button type="button" onClick={() => removeImage(index)} className="p-1 hover:bg-accent-red/20 rounded-lg text-foreground-muted hover:text-accent-red">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {imagens.length === 0 && (
                                <p className="text-center text-foreground-muted py-8 text-sm">Nenhuma imagem adicionada</p>
                            )}
                        </div>
                    </div>

                    <div className="col-span-full pt-6 border-t border-white/10 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-foreground-muted hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-[image:var(--gradient-glow)] text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 font-bold disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Salvar Projeto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
