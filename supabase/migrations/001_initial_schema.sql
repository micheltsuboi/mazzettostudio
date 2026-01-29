-- =============================================
-- MAZZETTO STUDIO - Database Schema
-- =============================================
-- Este script cria todas as tabelas necessárias para o sistema
-- Execute no SQL Editor do Supabase Dashboard

-- =============================================
-- 1. TABELA: clientes
-- =============================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social TEXT NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  responsavel TEXT,
  cpf VARCHAR(14),
  data_nascimento DATE,
  endereco TEXT,
  cidade TEXT,
  estado VARCHAR(2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Índices para performance
CREATE INDEX idx_clientes_user_id ON clientes(user_id);
CREATE INDEX idx_clientes_cnpj ON clientes(cnpj);

-- =============================================
-- 2. TABELA: jobs
-- =============================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  observacoes TEXT,
  valor DECIMAL(10, 2),
  tempo_total INTEGER DEFAULT 0, -- em segundos
  status VARCHAR(20) DEFAULT 'em_andamento', -- em_andamento, concluido, cancelado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Índices para performance
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_cliente_id ON jobs(cliente_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- =============================================
-- 3. TABELA: time_tracking
-- =============================================
CREATE TABLE IF NOT EXISTS time_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  inicio TIMESTAMP WITH TIME ZONE,
  fim TIMESTAMP WITH TIME ZONE,
  duracao INTEGER, -- em segundos, calculado automaticamente
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Índices para performance
CREATE INDEX idx_time_tracking_job_id ON time_tracking(job_id);
CREATE INDEX idx_time_tracking_user_id ON time_tracking(user_id);

-- =============================================
-- 4. TABELA: financeiro
-- =============================================
CREATE TABLE IF NOT EXISTS financeiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  data_vencimento DATE,
  data_pagamento DATE,
  status VARCHAR(20) DEFAULT 'a_receber' CHECK (status IN ('a_receber', 'pago', 'a_pagar')),
  categoria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Índices para performance
CREATE INDEX idx_financeiro_user_id ON financeiro(user_id);
CREATE INDEX idx_financeiro_job_id ON financeiro(job_id);
CREATE INDEX idx_financeiro_status ON financeiro(status);
CREATE INDEX idx_financeiro_tipo ON financeiro(tipo);

-- =============================================
-- 5. TABELA: categorias_portfolio
-- =============================================
CREATE TABLE IF NOT EXISTS categorias_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Índices para performance
CREATE INDEX idx_categorias_portfolio_slug ON categorias_portfolio(slug);
CREATE INDEX idx_categorias_portfolio_ativo ON categorias_portfolio(ativo);

-- =============================================
-- 6. TABELA: projetos_portfolio
-- =============================================
CREATE TABLE IF NOT EXISTS projetos_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id UUID REFERENCES categorias_portfolio(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  cliente TEXT,
  data_projeto DATE,
  ordem INTEGER DEFAULT 0,
  publicado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Índices para performance
CREATE INDEX idx_projetos_portfolio_categoria_id ON projetos_portfolio(categoria_id);
CREATE INDEX idx_projetos_portfolio_publicado ON projetos_portfolio(publicado);
CREATE INDEX idx_projetos_portfolio_user_id ON projetos_portfolio(user_id);

-- =============================================
-- 7. TABELA: imagens_portfolio
-- =============================================
CREATE TABLE IF NOT EXISTS imagens_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID REFERENCES projetos_portfolio(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  titulo TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Índices para performance
CREATE INDEX idx_imagens_portfolio_projeto_id ON imagens_portfolio(projeto_id);
CREATE INDEX idx_imagens_portfolio_user_id ON imagens_portfolio(user_id);

-- =============================================
-- POLÍTICAS RLS (Row Level Security)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagens_portfolio ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS - CLIENTES
-- =============================================
CREATE POLICY "Usuários podem ver seus próprios clientes"
  ON clientes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios clientes"
  ON clientes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios clientes"
  ON clientes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios clientes"
  ON clientes FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- POLÍTICAS - JOBS
-- =============================================
CREATE POLICY "Usuários podem ver seus próprios jobs"
  ON jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios jobs"
  ON jobs FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- POLÍTICAS - TIME_TRACKING
-- =============================================
CREATE POLICY "Usuários podem ver seus próprios registros de tempo"
  ON time_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios registros de tempo"
  ON time_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios registros de tempo"
  ON time_tracking FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios registros de tempo"
  ON time_tracking FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- POLÍTICAS - FINANCEIRO
-- =============================================
CREATE POLICY "Usuários podem ver seus próprios registros financeiros"
  ON financeiro FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios registros financeiros"
  ON financeiro FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios registros financeiros"
  ON financeiro FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios registros financeiros"
  ON financeiro FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- POLÍTICAS - CATEGORIAS_PORTFOLIO
-- =============================================
-- Admin pode gerenciar
CREATE POLICY "Usuários autenticados podem ver categorias ativas"
  ON categorias_portfolio FOR SELECT
  USING (ativo = true OR auth.uid() = user_id);

CREATE POLICY "Admin pode inserir categorias"
  ON categorias_portfolio FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin pode atualizar categorias"
  ON categorias_portfolio FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin pode deletar categorias"
  ON categorias_portfolio FOR DELETE
  USING (auth.uid() = user_id);

-- Público pode ver categorias ativas
CREATE POLICY "Público pode ver categorias ativas"
  ON categorias_portfolio FOR SELECT
  USING (ativo = true);

-- =============================================
-- POLÍTICAS - PROJETOS_PORTFOLIO
-- =============================================
-- Admin pode gerenciar
CREATE POLICY "Admin pode ver todos os projetos"
  ON projetos_portfolio FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin pode inserir projetos"
  ON projetos_portfolio FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin pode atualizar projetos"
  ON projetos_portfolio FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin pode deletar projetos"
  ON projetos_portfolio FOR DELETE
  USING (auth.uid() = user_id);

-- Público pode ver apenas projetos publicados
CREATE POLICY "Público pode ver projetos publicados"
  ON projetos_portfolio FOR SELECT
  USING (publicado = true);

-- =============================================
-- POLÍTICAS - IMAGENS_PORTFOLIO
-- =============================================
-- Admin pode gerenciar
CREATE POLICY "Admin pode ver todas as imagens"
  ON imagens_portfolio FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin pode inserir imagens"
  ON imagens_portfolio FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin pode atualizar imagens"
  ON imagens_portfolio FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin pode deletar imagens"
  ON imagens_portfolio FOR DELETE
  USING (auth.uid() = user_id);

-- Público pode ver imagens de projetos publicados
CREATE POLICY "Público pode ver imagens de projetos publicados"
  ON imagens_portfolio FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projetos_portfolio
      WHERE projetos_portfolio.id = imagens_portfolio.projeto_id
      AND projetos_portfolio.publicado = true
    )
  );

-- =============================================
-- FUNÇÕES E TRIGGERS
-- =============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financeiro_updated_at
  BEFORE UPDATE ON financeiro
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projetos_portfolio_updated_at
  BEFORE UPDATE ON projetos_portfolio
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular duração automaticamente no time_tracking
CREATE OR REPLACE FUNCTION calculate_time_tracking_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.inicio IS NOT NULL AND NEW.fim IS NOT NULL THEN
    NEW.duracao = EXTRACT(EPOCH FROM (NEW.fim - NEW.inicio))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_duration_before_insert_update
  BEFORE INSERT OR UPDATE ON time_tracking
  FOR EACH ROW
  EXECUTE FUNCTION calculate_time_tracking_duration();
