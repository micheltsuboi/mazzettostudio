-- Adicionar colunas de contato na tabela clientes
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS telefone TEXT;

-- Criação de índice para busca por email (opcional, mas útil)
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
