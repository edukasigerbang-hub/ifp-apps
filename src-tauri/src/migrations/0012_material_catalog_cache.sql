-- Cache katalog materi daring (ADR-0035 tahap 3b).
-- `downloadUrl` dari Worker adalah URL pre-signed berumur 10 menit dan
-- DILARANG disimpan (OD-12), jadi nilainya dikosongkan sebelum baris ditulis.
-- Cache hanya dipakai untuk menampilkan daftar saat server tidak terjangkau.
CREATE TABLE material_catalog_cache (
  cache_key TEXT PRIMARY KEY,
  etag TEXT,
  body TEXT NOT NULL,
  fetched_at TEXT NOT NULL
);
