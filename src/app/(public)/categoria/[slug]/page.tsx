import { createClient } from '@/lib/supabase/server'
import Header from '@/components/public/Header'
import MosaicGrid from '@/components/public/MosaicGrid'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const supabase = await createClient()

    // 1. Get Category by Slug
    const { data: categoria } = await supabase
        .from('categorias_portfolio')
        .select('id, nome')
        .eq('slug', slug)
        .single()

    if (!categoria) {
        notFound()
    }

    // 2. Fetch Projects for this Category
    const { data: projects } = await supabase
        .from('projetos_portfolio')
        .select(`
            *,
            imagens_portfolio (*)
        `)
        .eq('publicado', true)
        .eq('categoria_id', categoria.id)
        .order('ordem', { ascending: true })

    return (
        <main className="min-h-screen pt-[160px] md:pt-[200px]">
            <Header />
            <div className="container mx-auto px-4 mb-8 text-center md:hidden">
                <h1 className="text-xl font-bold uppercase tracking-widest">{categoria.nome}</h1>
            </div>
            <MosaicGrid projects={(projects as any) || []} />
        </main>
    )
}
