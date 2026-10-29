-- Enquiries are no longer stored (e-mail only). Only a short-lived rate-limit counter remains.
CREATE TABLE IF NOT EXISTS submit_attempts (ip_hash TEXT NOT NULL, at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_submit_attempts ON submit_attempts(ip_hash, at);
