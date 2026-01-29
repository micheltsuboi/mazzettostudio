import { createClient } from '@/lib/supabase/server'
import Header from '@/components/public/Header'
import MosaicGrid from '@/components/public/MosaicGrid'

export default async function HomePage() {
    const supabase = await createClient()

    // Fetch Published Projects with their Images
    const { data: projects } = await supabase
        .from('projetos_portfolio')
        .select(`
            *,
            imagens_portfolio (*)
        `)
        .eq('publicado', true)
        .order('ordem', { ascending: true })

    return (
        <main className="min-h-screen pt-[160px] md:pt-[200px]">
            <Header />
            <MosaicGrid projects={(projects as any) || []} />
        </main>
    )
}
