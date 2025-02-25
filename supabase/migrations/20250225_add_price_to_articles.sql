-- Add price column to articles table
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS price integer NOT NULL DEFAULT 0;

-- Add validation to ensure price is non-negative
ALTER TABLE public.articles
ADD CONSTRAINT articles_price_check CHECK (price >= 0);
