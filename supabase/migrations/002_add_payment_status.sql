-- Add payment status to jobs table
ALTER TABLE jobs ADD COLUMN status_pagamento text DEFAULT 'pendente';

-- Update existing jobs to have 'pendente' status
UPDATE jobs SET status_pagamento = 'pendente' WHERE status_pagamento IS NULL;
