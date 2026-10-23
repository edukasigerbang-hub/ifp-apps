ALTER TABLE content_packages ADD COLUMN activated_at TEXT;

UPDATE content_packages
SET activated_at = installed_at
WHERE status = 'active' AND source = 'imported';
