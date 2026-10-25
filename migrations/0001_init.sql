-- Leads and partner sign-ups (photos are only e-mailed, not stored)
CREATE TABLE IF NOT EXISTS leads (
  id          TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,              -- 'lead' | 'partner'
  data        TEXT NOT NULL,              -- JSON of submitted fields
  photos      INTEGER NOT NULL DEFAULT 0,
  ip          TEXT,
  country     TEXT,
  user_agent  TEXT,
  status      TEXT NOT NULL DEFAULT 'new',-- new | sent_to_partner | won | lost | spam
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at);
CREATE INDEX IF NOT EXISTS idx_leads_ip_created ON leads (ip, created_at);
