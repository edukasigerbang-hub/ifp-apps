-- Draft materi HTML5 yang dibuat di dalam aplikasi (Studio Materi, T-122).
-- Baris ini hanya indeks: isi draft berada di folder materi yang sama dengan
-- bundel terpasang (materials/<materialId>/<version>/) supaya dapat dilihat lewat
-- protokol ifp-content tanpa pelebaran CSP. Draft TIDAK PERNAH punya baris
-- material_install, jadi ia tidak muncul di daftar materi terpasang.
CREATE TABLE material_draft (
  material_id TEXT NOT NULL,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  template_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (material_id, version)
);
