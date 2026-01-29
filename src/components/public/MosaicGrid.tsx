'use client'

import { Database } from '@/types/database.types'
import ProjectCard from './ProjectCard'

type Project = Database['public']['Tables']['projetos_portfolio']['Row'] & {
    imagens_portfolio: Database['public']['Tables']['imagens_portfolio']['Row'][]
}

interface MosaicGridProps {
    projects: Project[]
}

export default function MosaicGrid({ projects }: MosaicGridProps) {
    if (!projects || projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-foreground-muted">
                <p>Nenhum projeto publicado ainda.</p>
            </div>
        )
    }

    // Pattern definition for a 6-column grid (lg) and 4-column grid (md)
    // We loop through this pattern
    const patterns = [
        // Format: [col-span, row-span] (Tailwind classes will be derived)
        // 1. Hero Item (Large Square)
        'md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2 aspect-square',
        // 2. Tall Item
        'md:col-span-1 md:row-span-2 lg:col-span-1 lg:row-span-2 aspect-[1/2]',
        // 3. Small Item
        'md:col-span-1 md:row-span-1 lg:col-span-1 lg:row-span-1 aspect-square',
        // 4. Small Item
        'md:col-span-1 md:row-span-1 lg:col-span-1 lg:row-span-1 aspect-square',
        // 5. Wide Item
        'md:col-span-2 md:row-span-1 lg:col-span-2 lg:row-span-1 aspect-[2/1]',
        // 6. Large Item again
        'md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2 aspect-square',
        // 7. Small
        'md:col-span-1 md:row-span-1 lg:col-span-1 lg:row-span-1 aspect-square',
        // 8. Tall
        'md:col-span-1 md:row-span-2 lg:col-span-1 lg:row-span-2 aspect-[1/2]',
    ]

    return (
        <div className="container mx-auto px-4 pb-20">
            {/* 
                Grid Layout:
                - Mobile: 1 column (default) or 2 columns
                - MD: 4 columns
                - LG: 4 columns (keeping it 4 for better control or 6?)
                Let's stick to 4 columns on desktop for manageable chunks.
                'grid-flow-dense' helps fill gaps.
            */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[minmax(150px,auto)] md:auto-rows-[250px] lg:auto-rows-[300px] grid-flow-dense">
                {projects.map((project, index) => {
                    // Pick a pattern based on index, cycling through valid patterns
                    const patternClass = patterns[index % patterns.length]

                    return (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            className={`${patternClass} w-full h-full`}
                        />
                    )
                })}
            </div>
        </div>
    )
}
