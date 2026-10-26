-- Foto profil disimpan lokal di database agar ikut terbawa backup.
CREATE TABLE profile_avatars (
  profile_id TEXT PRIMARY KEY,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/png', 'image/jpeg', 'image/webp')),
  bytes BLOB NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);
