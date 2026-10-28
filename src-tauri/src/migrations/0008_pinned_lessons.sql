-- Materi yang disematkan per profil agar selalu tampil di Beranda.
CREATE TABLE pinned_lessons (
  profile_id TEXT NOT NULL,
  package_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  pinned_at TEXT NOT NULL,
  PRIMARY KEY (profile_id, package_id, lesson_id),
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX pinned_lessons_profile ON pinned_lessons (profile_id, pinned_at DESC);
