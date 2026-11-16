-- Materi HTML5 (bundel terpasang) yang disematkan per profil.
-- Tidak ada foreign key ke `material_install`: tabel itu memakai PK
-- (material_id, version), sehingga `material_id` saja bukan kunci unik.
-- Keberadaan materi divalidasi saat menyematkan dan baris yang menunjuk
-- materi tak-terpasang dibuang saat daftar dibaca.
CREATE TABLE pinned_materials (
  profile_id TEXT NOT NULL,
  material_id TEXT NOT NULL,
  pinned_at TEXT NOT NULL,
  PRIMARY KEY (profile_id, material_id),
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX pinned_materials_profile ON pinned_materials (profile_id, pinned_at DESC);
