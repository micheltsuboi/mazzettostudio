'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Loader2, MessageSquare, Phone, Mail } from 'lucide-react'
import Image from 'next/image'

export default function ContatoPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('contacts')
                .insert({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message
                } as any)

            if (error) throw error

            setSuccess(true)
            setFormData({ name: '', email: '', message: '' })

            // Reset success message after 5s
            setTimeout(() => setSuccess(false), 5000)

        } catch (error) {
            console.error('Error sending message:', error)
            alert('Erro ao enviar mensagem. Tente novamente ou chame no WhatsApp.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen py-32 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        Vamos criar algo <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">extraordinário juntos?</span>
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Seja para um projeto de retoque complexo ou uma nova parceria, estamos prontos para elevar o nível da sua imagem.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

                    {/* Contact Info & WhatsApp */}
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700 delay-150">
                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-indigo-600" />
                                Canais Diretos
                            </h3>

                            <div className="space-y-6">
                                <a
                                    href="https://wa.me/5544999911039"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-green-50/50 hover:bg-green-100/50 border border-green-100 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                                        <Phone className="w-5 h-5 fill-current" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-0.5">WhatsApp</p>
                                        <p className="text-slate-900 font-bold text-lg">+55 (44) 99991-1039</p>
                                    </div>
                                </a>

                                <a
                                    href="mailto:contato.mazzetto@gmail.com"
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/50 hover:bg-blue-100/50 border border-blue-100 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">Email</p>
                                        <p className="text-slate-900 font-bold text-lg">contato.mazzetto@gmail.com</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
                            {/* Placeholder for a cool office image or work showcase */}
                            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-white text-opacity-30">
                                <span className="font-bold tracking-widest uppercase text-sm">Mazzetto Studio Workspace</span>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 animate-in fade-in slide-in-from-right-4 duration-700 delay-300 relative overflow-hidden">
                        {success && (
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-green-500/30">
                                    <Check className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Mensagem Enviada!</h3>
                                <p className="text-slate-600">Em breve entraremos em contato com você.</p>
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-700 underline"
                                >
                                    Enviar outra mensagem
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-indigo-600" />
                                Envie uma mensagem
                            </h3>

                            <div>
                                <label htmlFor="name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Como devemos te chamar?"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">
                                    Mensagem
                                </label>
                                <textarea
                                    id="message"
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                                    placeholder="Conte-nos sobre seu projeto..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-6 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Mensagem'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
