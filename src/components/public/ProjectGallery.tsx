'use client'

import { useState } from 'react'
import Image from 'next/image'
import Lightbox from './Lightbox'
import { Database } from '@/types/database.types'

type Imagem = Database['public']['Tables']['imagens_portfolio']['Row']

interface ProjectGalleryProps {
    images: Imagem[]
    projectTitle: string
}

export default function ProjectGallery({ images, projectTitle }: ProjectGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index)
        setLightboxOpen(true)
    }

    return (
        <>
            <div className="space-y-4 md:space-y-12">
                {images.map((img, index) => (
                    <div
                        key={img.id}
                        className="relative w-full cursor-zoom-in group"
                        onClick={() => openLightbox(index)}
                    >
                        <Image
                            src={img.url}
                            alt={img.titulo || projectTitle}
                            width={2000} // Increased base width
                            height={1200}
                            className="w-full h-auto object-contain max-h-[90vh] mx-auto bg-surface-highlight/10 transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                            priority={index === 0}
                            unoptimized={true} // Disable Next.js resize/compression
                            quality={100}
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
                    </div>
                ))}
            </div>

            <Lightbox
                images={images}
                initialIndex={currentImageIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
            />
        </>
    )
}
