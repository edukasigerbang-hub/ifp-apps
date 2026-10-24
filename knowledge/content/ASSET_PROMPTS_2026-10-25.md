# Prompt Pack Aset — 2026-10-25

**Status:** `SIAP-PAKAI` untuk Google Flow atau generator gambar lain.
**CSV lengkap:** [`asset-prompts-2026-10-25.csv`](asset-prompts-2026-10-25.csv)

## Isi

- **Cover kelas:** 6 prompt (16:9)
- **Cover pelajaran:** 7 prompt (16:9)
- **Gambar materi:** 320 prompt (4:3)
- **Total:** 333 prompt

## Gaya global

- Flat vector, bentuk membulat, warna teal/oranye/navy/krem agar selaras dengan aplikasi.
- Latar sederhana, ruang kosong untuk overlay judul (cover).
- Konteks Indonesia, anak beragam, sopan, aman untuk anak SD.
- **Tanpa teks/angka/logo/watermark**; angka divisualkan sebagai objek atau blok.
- Negative prompt sudah disertakan di setiap baris CSV.

## Cara pakai di Google Flow

1. Impor CSV ke spreadsheet; buat kolom bantu `finalPrompt = prompt + "\nAvoid: " + negativePrompt`.
2. Generate cover lebih dulu (13 gambar), pilih yang konsisten, lalu jadikan referensi gaya.
3. Generate materi per batch 10–20, simpan dengan `suggestedFilename`.
4. Untuk cover: 1792×1024 atau 16:9; untuk materi: 1024×768 lalu turunkan ke 800×600.
5. Periksa tidak ada teks/logo yang tidak diinginkan sebelum dipakai.

## Contoh prompt cover

### Kelas 1 — Awal Menjelajah

```text
Wide 16:9 cover illustration for grade 1 of an Indonesian elementary school learning app. Cheerful classroom corner with very young children exploring picture books, colorful counting blocks, crayons, and simple shapes. Soft flat vector style, rounded shapes, warm teal, orange, navy and cream palette, uncluttered composition with space at the top for a title overlay, diverse Indonesian children, respectful and friendly, no text.

Avoid: text, letters, numbers, words, watermark, logo, signature, photorealistic faces of real people, scary imagery, violence, religious disrespect, stereotypes, clutter, distorted hands, extra limbs
```

### Kelas 2 — Membaca dan Berhitung

```text
Wide 16:9 cover illustration for grade 2 of an Indonesian elementary school learning app. Children reading a big picture book, counting objects in small baskets, and playing with geometric shapes in a bright classroom with a plant by the window. Soft flat vector style, rounded shapes, warm teal, orange, navy and cream palette, space at the top for a title overlay, no text.

Avoid: text, letters, numbers, words, watermark, logo, signature, photorealistic faces of real people, scary imagery, violence, religious disrespect, stereotypes, clutter, distorted hands, extra limbs
```

## Contoh prompt materi

### materi-kelas1-pai-b08-adab

```text
Educational illustration for grade 1 PAI in an Indonesian elementary school app, topic "Adab Sehari-hari". Membiasakan adab baik setiap hari. Show mosque silhouette, closed Quran on a rehal, prayer mat, dates and water, lantern; respectful, no depiction of prophets or God. Flat vector style, soft rounded shapes, warm teal, orange, navy and cream palette, simple uncluttered background, child-friendly, culturally appropriate Indonesian context, diverse children when people are shown, respectful, no text.

Avoid: text, letters, numbers, words, watermark, logo, signature, photorealistic faces of real people, scary imagery, violence, religious disrespect, stereotypes, clutter, distorted hands, extra limbs
```

### materi-kelas1-pai-b03-akhlak

```text
Educational illustration for grade 1 PAI in an Indonesian elementary school app, topic "Akhlak Terpuji". Membiasakan akhlak terpuji sehari-hari. Show mosque silhouette, closed Quran on a rehal, prayer mat, dates and water, lantern; respectful, no depiction of prophets or God. Flat vector style, soft rounded shapes, warm teal, orange, navy and cream palette, simple uncluttered background, child-friendly, culturally appropriate Indonesian context, diverse children when people are shown, respectful, no text.

Avoid: text, letters, numbers, words, watermark, logo, signature, photorealistic faces of real people, scary imagery, violence, religious disrespect, stereotypes, clutter, distorted hands, extra limbs
```

### materi-kelas1-seni-rupa-b07-apresiasi

```text
Educational illustration for grade 1 Seni Rupa in an Indonesian elementary school app, topic "Apresiasi Karya". Mengamati dan menghargai karya seni. Show art supplies, paint palette, brushes, colored paper collage, clay, simple gallery wall. Flat vector style, soft rounded shapes, warm teal, orange, navy and cream palette, simple uncluttered background, child-friendly, culturally appropriate Indonesian context, diverse children when people are shown, respectful, no text.

Avoid: text, letters, numbers, words, watermark, logo, signature, photorealistic faces of real people, scary imagery, violence, religious disrespect, stereotypes, clutter, distorted hands, extra limbs
```

## Catatan kualitas

- Prompt materi dibuat dari judul + ringkasan paket; hasil tetap harus diperiksa manusia.
- Jangan memakai gambar yang mengandung teks salah eja; overlay teks dilakukan aplikasi, bukan generator.
- Simpan metadata sumber/ lisensi gambar yang dipakai.
