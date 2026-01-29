-- Adicionar coluna quantidade na tabela jobs
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS quantidade INTEGER DEFAULT 1;

-- Atualizar jobs existentes para ter quantidade 1 se estiver nulo (por segurança)
UPDATE jobs SET quantidade = 1 WHERE quantidade IS NULL;
