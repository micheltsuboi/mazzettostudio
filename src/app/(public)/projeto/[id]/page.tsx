import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProjectGallery from '@/components/public/ProjectGallery'

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'

export default async function ProjectPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const { data: project } = await supabase
        .from('projetos_portfolio')
        .select(`
            *,
            categoria:categorias_portfolio(nome),
            imagens:imagens_portfolio(*)
        `)
        .eq('id', id)
        .eq('publicado', true)
        .single() as any

    if (!project) {
        notFound()
    }

    // Sort images by order
    const sortedImages = project.imagens?.sort((a: any, b: any) => a.ordem - b.ordem) || []

    return (
        <main className="min-h-screen bg-background text-foreground pb-20 pt-24 md:pt-32">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-12 md:mb-20 text-center space-y-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground-muted hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </Link>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter">
                        {project.titulo}
                    </h1>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm uppercase tracking-widest text-foreground-muted">
                        {project.cliente && (
                            <span>{project.cliente}</span>
                        )}
                        {project.categoria?.nome && (
                            <>
                                <span className="hidden md:inline">•</span>
                                <span>{project.categoria.nome}</span>
                            </>
                        )}
                        {project.data_projeto && (
                            <>
                                <span className="hidden md:inline">•</span>
                                <span>{new Date(project.data_projeto).getFullYear()}</span>
                            </>
                        )}
                    </div>

                    {project.descricao && (
                        <div className="max-w-2xl mx-auto mt-8 text-base md:text-lg text-foreground-muted normal-case font-light leading-relaxed">
                            {project.descricao}
                        </div>
                    )}
                </div>

                {/* Gallery - Vertical Stack for Impact */}
                <ProjectGallery images={sortedImages} projectTitle={project.titulo} />
            </div>
        </main>
    )
}
