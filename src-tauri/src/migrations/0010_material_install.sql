-- Bundel materi HTML5 yang dipasang dari ZIP bertanda tangan (kontrak bundel v1 §8).
-- `sha256` adalah SHA-256 material.json kanonik; manifest itu sendiri memuat hash tiap berkas.
CREATE TABLE material_install (
  material_id TEXT NOT NULL,
  version TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes >= 0),
  state TEXT NOT NULL CHECK (state IN ('staged', 'active', 'superseded')),
  installed_at TEXT NOT NULL,
  last_opened_at TEXT,
  PRIMARY KEY (material_id, version)
);

CREATE INDEX material_install_active ON material_install (material_id, state);
