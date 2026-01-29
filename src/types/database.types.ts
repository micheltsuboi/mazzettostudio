// Tipos TypeScript gerados automaticamente pelo Supabase CLI
// Execute: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            clientes: {
                Row: {
                    id: string
                    razao_social: string
                    cnpj: string | null
                    responsavel: string | null
                    cpf: string | null
                    data_nascimento: string | null
                    endereco: string | null
                    cidade: string | null
                    estado: string | null
                    email: string | null
                    telefone: string | null
                    created_at: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    razao_social: string
                    cnpj?: string | null
                    responsavel?: string | null
                    cpf?: string | null
                    data_nascimento?: string | null
                    endereco?: string | null
                    cidade?: string | null
                    estado?: string | null
                    email?: string | null
                    telefone?: string | null
                    created_at?: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    id?: string
                    razao_social?: string
                    cnpj?: string | null
                    responsavel?: string | null
                    cpf?: string | null
                    data_nascimento?: string | null
                    endereco?: string | null
                    cidade?: string | null
                    estado?: string | null
                    email?: string | null
                    telefone?: string | null
                    created_at?: string
                    updated_at?: string
                    user_id?: string
                }
            }
            jobs: {
                Row: {
                    id: string
                    cliente_id: string | null
                    titulo: string
                    observacoes: string | null
                    valor: number | null
                    tempo_total: number
                    quantidade: number
                    status: string
                    created_at: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    cliente_id?: string | null
                    titulo: string
                    observacoes?: string | null
                    valor?: number | null
                    tempo_total?: number
                    quantidade?: number
                    status?: string
                    created_at?: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    id?: string
                    cliente_id?: string | null
                    titulo?: string
                    observacoes?: string | null
                    valor?: number | null
                    tempo_total?: number
                    quantidade?: number
                    status?: string
                    created_at?: string
                    updated_at?: string
                    user_id?: string
                }
            }
            time_tracking: {
                Row: {
                    id: string
                    job_id: string
                    inicio: string | null
                    fim: string | null
                    duracao: number | null
                    observacao: string | null
                    created_at: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    job_id: string
                    inicio?: string | null
                    fim?: string | null
                    duracao?: number | null
                    observacao?: string | null
                    created_at?: string
                    user_id: string
                }
                Update: {
                    id?: string
                    job_id?: string
                    inicio?: string | null
                    fim?: string | null
                    duracao?: number | null
                    observacao?: string | null
                    created_at?: string
                    user_id?: string
                }
            }
            financeiro: {
                Row: {
                    id: string
                    tipo: string
                    job_id: string | null
                    descricao: string
                    valor: number
                    data_vencimento: string | null
                    data_pagamento: string | null
                    status: string
                    categoria: string | null
                    created_at: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    tipo: string
                    job_id?: string | null
                    descricao: string
                    valor: number
                    data_vencimento?: string | null
                    data_pagamento?: string | null
                    status?: string
                    categoria?: string | null
                    created_at?: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    id?: string
                    tipo?: string
                    job_id?: string | null
                    descricao?: string
                    valor?: number
                    data_vencimento?: string | null
                    data_pagamento?: string | null
                    status?: string
                    categoria?: string | null
                    created_at?: string
                    updated_at?: string
                    user_id?: string
                }
            }
            categorias_portfolio: {
                Row: {
                    id: string
                    nome: string
                    slug: string
                    ordem: number
                    ativo: boolean
                    created_at: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    nome: string
                    slug: string
                    ordem?: number
                    ativo?: boolean
                    created_at?: string
                    user_id: string
                }
                Update: {
                    id?: string
                    nome?: string
                    slug?: string
                    ordem?: number
                    ativo?: boolean
                    created_at?: string
                    user_id?: string
                }
            }
            projetos_portfolio: {
                Row: {
                    id: string
                    categoria_id: string | null
                    titulo: string
                    descricao: string | null
                    cliente: string | null
                    data_projeto: string | null
                    ordem: number
                    publicado: boolean
                    created_at: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    categoria_id?: string | null
                    titulo: string
                    descricao?: string | null
                    cliente?: string | null
                    data_projeto?: string | null
                    ordem?: number
                    publicado?: boolean
                    created_at?: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    id?: string
                    categoria_id?: string | null
                    titulo?: string
                    descricao?: string | null
                    cliente?: string | null
                    data_projeto?: string | null
                    ordem?: number
                    publicado?: boolean
                    created_at?: string
                    updated_at?: string
                    user_id?: string
                }
            }
            imagens_portfolio: {
                Row: {
                    id: string
                    projeto_id: string
                    url: string
                    titulo: string | null
                    ordem: number
                    created_at: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    projeto_id: string
                    url: string
                    titulo?: string | null
                    ordem?: number
                    created_at?: string
                    user_id: string
                }
                Update: {
                    id?: string
                    projeto_id?: string
                    url?: string
                    titulo?: string | null
                    ordem?: number
                    created_at?: string
                    user_id?: string
                }
            }
            page_views: {
                Row: {
                    id: string
                    created_at: string
                    path: string
                    user_agent: string | null
                    ip: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    path: string
                    user_agent?: string | null
                    ip?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    path?: string
                    user_agent?: string | null
                    ip?: string | null
                }
            }
            contacts: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    email: string
                    message: string
                    read: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    email: string
                    message: string
                    read?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    email?: string
                    message?: string
                    read?: boolean
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
