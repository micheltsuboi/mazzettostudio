'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Database } from '@/types/database.types'

type Project = Database['public']['Tables']['projetos_portfolio']['Row'] & {
    imagens_portfolio: Database['public']['Tables']['imagens_portfolio']['Row'][]
}

interface ProjectCardProps {
    project: Project
    className?: string
}

export default function ProjectCard({ project, className }: ProjectCardProps) {
    // Pegar a imagem principal (ordem 0) ou a primeira disponível
    const mainImage = project.imagens_portfolio?.sort((a, b) => a.ordem - b.ordem)[0]

    if (!mainImage) return null

    return (
        <Link
            href={`/projeto/${project.id}`}
            className={`block relative group overflow-hidden bg-surface-highlight ${className || ''}`}
        >
            {/* Image Container */}
            <div className="absolute inset-0 w-full h-full">
                <Image
                    src={mainImage.url}
                    alt={project.titulo}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                />
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 z-10">
                <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white text-lg md:text-xl font-bold uppercase tracking-wider">
                        {project.titulo}
                    </h3>
                    {project.cliente && (
                        <p className="text-white/80 text-xs md:text-sm mt-1 uppercase tracking-widest">
                            {project.cliente}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    )

}
