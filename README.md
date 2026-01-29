# Mazzetto Studio - Landing Page + Painel Admin

Sistema completo de portfólio com painel administrativo integrado.

## 🚀 Stack Tecnológica

- **Frontend:** Next.js 16 (App Router)
- **Backend/Banco:** Supabase
- **Estilização:** Tailwind CSS
- **Linguagem:** TypeScript

## 📋 Pré-requisitos

1. Node.js 18+ instalado
2. Conta no Supabase
3. Git configurado

## ⚙️ Configuração do Projeto

### 1. Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Aguarde a criação do banco de dados
3. No dashboard do Supabase, vá em **SQL Editor**
4. Execute o conteúdo do arquivo `supabase/migrations/001_initial_schema.sql`
5. Vá em **Project Settings > API** e copie:
   - `Project URL`
   - `anon public key`

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env.local` e adicione suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-project-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 3. Criar Primeiro Usuário Admin

No Supabase Dashboard:
1. Vá em **Authentication > Users**
2. Clique em **Add User**
3. Adicione um email e senha
4. Esse será seu usuário admin

### 4. Instalar Dependências & Rodar o Projeto

```bash
npm install
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
mazzetto-studio/
├── src/
│   ├── app/                    # App Router do Next.js
│   │   ├── (public)/          # Rotas públicas (landing page)
│   │   ├── admin/             # Painel administrativo
│   │   └── auth/              # Autenticação
│   ├── components/
│   │   ├── admin/             # Componentes do admin
│   │   ├── public/            # Componentes públicos
│   │   └── ui/                # Componentes reutilizáveis
│   ├── lib/
│   │   ├── supabase/          # Configuração Supabase
│   │   └── utils.ts           # Utilitários
│   └── types/
│       └── database.types.ts  # Types do banco
├── supabase/
│   └── migrations/            # Scripts SQL
└── public/                    # Arquivos estáticos
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais:

1. **clientes** - Gestão de clientes
2. **jobs** - Gestão de trabalhos/projetos
3. **time_tracking** - Cronometragem de tempo
4. **financeiro** - Controle financeiro
5. **categorias_portfolio** - Categorias do portfólio
6. **projetos_portfolio** - Projetos exibidos na landing
7. **imagens_portfolio** - Imagens dos projetos

## 🔐 Segurança

- **RLS (Row Level Security)** habilitado em todas as tabelas
- Admin autenticado tem acesso total aos seus dados
- Landing page pública tem acesso somente leitura a projetos publicados
- Middleware protege rotas `/admin/*`

## 🎨 Funcionalidades

### Painel Admin
- ✅ Dashboard com métricas e gráficos
- ✅ CRUD completo de Clientes
- ✅ Gestão de Jobs com time tracking
- ✅ Controle Financeiro (entradas/saídas)
- ✅ Gestão de Portfólio (categorias e projetos)

### Landing Page
- ✅ Design minimalista focado em imagens
- ✅ Menu dinâmico baseado em categorias
- ✅ Galeria de projetos
- ✅ Lightbox para visualização
- ✅ Página de contato

## 📝 Próximos Passos

1. Execute o script SQL no Supabase
2. Configure as variáveis de ambiente
3. Crie seu usuário admin
4. Comece a desenvolver!

## 🤝 Suporte

Para dúvidas ou problemas, consulte a documentação:
- [Next.js](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
