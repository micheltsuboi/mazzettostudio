'use client'

import { useState } from 'react'
import CategoriesTab from './CategoriesTab'
import ProjectsTab from './ProjectsTab'

export default function PortfolioManager() {
    const [activeTab, setActiveTab] = useState<'projects' | 'categories'>('projects')

    return (
        <div className="space-y-6">
            <div className="flex bg-surface-highlight p-1 rounded-xl w-fit border border-white/5">
                <button
                    onClick={() => setActiveTab('projects')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'projects'
                        ? 'bg-surface text-white shadow-lg shadow-purple-500/10 border border-white/10'
                        : 'text-foreground-muted hover:text-white hover:bg-white/5'
                        }`}
                >
                    Projetos
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'categories'
                        ? 'bg-surface text-white shadow-lg shadow-purple-500/10 border border-white/10'
                        : 'text-foreground-muted hover:text-white hover:bg-white/5'
                        }`}
                >
                    Categorias
                </button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'projects' ? <ProjectsTab /> : <CategoriesTab />}
            </div>
        </div>
    )
}
