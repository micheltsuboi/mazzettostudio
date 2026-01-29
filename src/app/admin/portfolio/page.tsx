import { Metadata } from 'next'
import PortfolioManager from '@/components/admin/PortfolioManager'

export const metadata: Metadata = {
    title: 'Portfólio | Admin',
    description: 'Gestão de projetos e categorias',
}

export default function PortfolioPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Portfólio</h1>
                <p className="text-foreground-muted">Gerencie seus projetos e categorias</p>
            </div>

            <PortfolioManager />
        </div>
    )
}
