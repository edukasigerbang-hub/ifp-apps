-- Keadaan antarmuka ringan per profil (tab Beranda, posisi soal kuis).
CREATE TABLE profile_ui_state (
  profile_id TEXT NOT NULL,
  state_key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (profile_id, state_key),
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);
