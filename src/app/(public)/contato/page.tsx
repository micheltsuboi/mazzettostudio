export default function ContatoPage() {
    return (
        <div className="min-h-screen py-20 px-6">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        Entre em Contato
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Vamos conversar sobre seu próximo projeto
                    </p>
                </div>

                <form className="space-y-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                            Nome
                        </label>
                        <input
                            type="text"
                            id="name"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Seu nome"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                            Mensagem
                        </label>
                        <textarea
                            id="message"
                            rows={6}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Conte-nos sobre seu projeto..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-6 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        Enviar Mensagem
                    </button>
                </form>
            </div>
        </div>
    )
}
