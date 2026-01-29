'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { Database } from '@/types/database.types'

type Imagem = Database['public']['Tables']['imagens_portfolio']['Row']

interface LightboxProps {
    images: Imagem[]
    initialIndex: number
    isOpen: boolean
    onClose: () => void
}

export default function Lightbox({ images, initialIndex, isOpen, onClose }: LightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)

    useEffect(() => {
        setCurrentIndex(initialIndex)
    }, [initialIndex])

    // Reset body scroll when opening/closing
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [isOpen])

    // Keyboard navigation
    const handleNext = useCallback(() => {
        setCurrentIndex(prev => (prev + 1) % images.length)
    }, [images.length])

    const handlePrev = useCallback(() => {
        setCurrentIndex(prev => (prev - 1 + images.length) % images.length)
    }, [images.length])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowRight') handleNext()
            if (e.key === 'ArrowLeft') handlePrev()
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose, handleNext, handlePrev])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300">
            {/* Controls */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[101]"
            >
                <X className="w-8 h-8" />
            </button>

            {images.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all z-[101]"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all z-[101]"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                </>
            )}

            {/* Image */}
            <div className="relative max-w-7xl w-full h-full p-4 md:p-12 flex items-center justify-center">
                {images[currentIndex] && (
                    <img
                        src={images[currentIndex].url}
                        alt={images[currentIndex].titulo || 'Portfolio Image'}
                        className="max-h-full max-w-full object-contain shadow-2xl"
                    />
                )}

                {/* Caption */}
                <div className="absolute bottom-8 left-0 right-0 text-center">
                    <p className="text-white/80 text-sm font-medium tracking-wide">
                        {images[currentIndex].titulo}
                        <span className="mx-2 text-white/30">•</span>
                        {currentIndex + 1} / {images.length}
                    </p>
                </div>
            </div>
        </div>
    )
}
