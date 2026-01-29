'use client'

import Image from 'next/image'

interface FooterProps {
    variant?: 'light' | 'dark'
}

export default function Footer({ variant = 'light' }: FooterProps) {
    const isDark = variant === 'dark'

    return (
        <footer className={`w-full py-8 px-4 mt-auto border-t ${isDark
            ? 'bg-surface border-white/5 text-foreground-muted'
            : 'bg-background border-black/5 text-gray-500'
            }`}>
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">

                {/* Logo Mazzetto + Copyright */}
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                    {/* Logo (Assuming we use the same logo file, possibly filtering it for dark mode if needed) */}
                    <div className={`relative h-6 w-24 ${!isDark ? 'brightness-100' : 'brightness-0 invert opacity-70'}`}>
                        <Image
                            src="/logo.png"
                            alt="Mazzetto Studio"
                            fill
                            className="object-contain"
                        />
                    </div>

                    <p className="text-[10px] uppercase tracking-widest text-center md:text-left">
                        © {new Date().getFullYear()} Mazzetto Studio. Todos os direitos reservados.
                    </p>
                </div>

                {/* Developer Credit */}
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest">
                    <span>Desenvolvido por</span>
                    <a
                        href="https://mybusinessai.com.br/"
                        target="_blank"
                        rel="noreferrer"
                        className="relative h-6 w-24 hover:opacity-80 transition-opacity"
                    >
                        <Image
                            src="/my-business-ai.png"
                            alt="My Business AI"
                            fill
                            className="object-contain"
                        />
                    </a>
                </div>
            </div>
        </footer>
    )
}
