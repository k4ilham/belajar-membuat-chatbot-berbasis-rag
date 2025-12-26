-- Aktifkan pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 3 user random
CREATE USER user_alpha WITH PASSWORD 'alpha_!92X';
CREATE USER user_beta  WITH PASSWORD 'beta_#73Q';
CREATE USER user_gamma WITH PASSWORD 'gamma_$55Z';

GRANT CONNECT ON DATABASE vectordb TO user_alpha, user_beta, user_gamma;
GRANT USAGE ON SCHEMA public TO user_alpha, user_beta, user_gamma;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO user_alpha, user_beta, user_gamma;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLES
TO user_alpha, user_beta, user_gamma;

GRANT CREATE ON SCHEMA public
TO user_alpha, user_beta, user_gamma;
