-- Ikatan keputusan review ke isi yang benar-benar diperiksa.
-- NULL pada baris lama: catatan sebelum ikatan ada, jadi tidak boleh dianggap sah untuk isi sekarang.
ALTER TABLE content_reviews ADD COLUMN content_sha256 TEXT;
ALTER TABLE content_reviews ADD COLUMN rubric_version TEXT;
