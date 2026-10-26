// Menulis 16 paket IPAS kelas 1–2 (8 per kelas) dari tabel topik di bawah.
// Aset memakai cover mapel IPAS yang sudah ada sebagai pengganti sementara;
// ilustrasi Flow menyusul dan cukup menimpa berkas assets/<slug>.webp.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const COVER_SOURCE = path.resolve("content/covers/pelajaran/cover-mapel-ipas.webp");
const PACKAGES_ROOT = path.resolve("content/packages");
const ASSET_ALT =
  "Ilustrasi 3D tanaman muda berakar, model relief bumi, bola dunia, dan gelas kimia berisi cairan oranye.";

const topics = [
  {
    grade: 1,
    code: "b01",
    slug: "tubuh-dan-indera",
    title: "Tubuhku dan Inderaku",
    summary:
      "Mengenal bagian tubuh dan lima indera beserta kegunaannya dalam kegiatan sehari-hari.",
    objectives: [
      "Menyebutkan bagian utama tubuh manusia.",
      "Menjelaskan kegunaan lima indera.",
      "Menunjukkan cara merawat tubuh agar tetap sehat."
    ],
    explorationTitle: "Mengamati Tubuh dan Indera",
    explorationInstructions:
      "Amati gambar, lalu jawab pertanyaan tentang tubuh dan inderamu.",
    steps: [
      {
        prompt: "Bagian tubuh apa saja yang kamu punya?",
        reveal: "Kepala, badan, tangan, dan kaki.",
        hint: "Lihat tubuhmu dari atas ke bawah."
      },
      {
        prompt: "Indera apa yang ada di wajahmu?",
        reveal:
          "Mata untuk melihat, hidung untuk mencium, telinga untuk mendengar, dan lidah untuk merasakan.",
        hint: "Kulit juga indera peraba."
      },
      {
        prompt: "Bagaimana cara menjaga tubuh tetap sehat?",
        reveal:
          "Mandi setiap hari, mencuci tangan dengan sabun, menyikat gigi, dan makan makanan bergizi.",
        hint: "Lakukan setiap hari, bukan hanya kadang-kadang."
      },
      {
        prompt: "Indera apa yang kamu pakai saat mendengar bel sekolah?",
        reveal: "Telinga. Telinga adalah indera pendengar.",
        hint: "Ada di kedua sisi kepalamu."
      }
    ],
    practiceTitle: "Memasangkan Indera dan Kegunaannya",
    practiceInstructions: "Pasangkan setiap indera dengan kegunaannya.",
    pairs: [
      ["Mata", "Melihat"],
      ["Telinga", "Mendengar"],
      ["Hidung", "Mencium bau"],
      ["Lidah", "Merasakan rasa"],
      ["Kulit", "Meraba"],
      ["Kaki", "Berjalan"]
    ],
    questions: [
      {
        prompt: "Indera apa yang kita pakai untuk melihat?",
        options: ["Mata", "Telinga", "Hidung"],
        answer: 0
      },
      {
        prompt: "Bagian tubuh yang kita pakai untuk berjalan adalah …",
        options: ["Tangan", "Kaki", "Kepala"],
        answer: 1
      }
    ]
  },
  {
    grade: 1,
    code: "b02",
    slug: "makhluk-hidup-di-sekitarku",
    title: "Makhluk Hidup di Sekitar Kita",
    summary: "Mengenal makhluk hidup dan benda tak hidup di rumah dan di sekolah.",
    objectives: [
      "Membedakan makhluk hidup dan benda tak hidup.",
      "Menyebutkan contoh makhluk hidup di sekitar.",
      "Menjelaskan kebutuhan makhluk hidup."
    ],
    explorationTitle: "Mengamati Makhluk Hidup",
    explorationInstructions:
      "Amati gambar, lalu jawab pertanyaan tentang makhluk hidup di sekitarmu.",
    steps: [
      {
        prompt: "Makhluk hidup apa yang kamu lihat di rumah?",
        reveal: "Kucing, ayam, burung, pohon, dan rumput.",
        hint: "Cari yang bisa bergerak atau tumbuh."
      },
      {
        prompt: "Apa bedanya makhluk hidup dan benda tak hidup?",
        reveal: "Makhluk hidup bernapas, tumbuh, dan butuh makanan. Batu tidak.",
        hint: "Bandingkan kucing dengan batu."
      },
      {
        prompt: "Apa kebutuhan makhluk hidup?",
        reveal: "Air, makanan, udara, dan tempat hidup.",
        hint: "Semua makhluk hidup butuh air."
      },
      {
        prompt: "Sebutkan satu benda tak hidup di kelasmu.",
        reveal: "Meja, kursi, atau papan tulis. Benda tak hidup tidak bernapas.",
        hint: "Benda tak hidup tidak tumbuh."
      }
    ],
    practiceTitle: "Memasangkan Makhluk Hidup dan Cirinya",
    practiceInstructions: "Pasangkan setiap makhluk atau benda dengan cirinya.",
    pairs: [
      ["Kucing", "Bisa bergerak sendiri"],
      ["Pohon", "Bisa tumbuh tinggi"],
      ["Batu", "Tidak bernapas"],
      ["Burung", "Bertelur"],
      ["Rumput", "Berwarna hijau"],
      ["Meja", "Benda tak hidup"]
    ],
    questions: [
      {
        prompt: "Manakah yang termasuk makhluk hidup?",
        options: ["Batu", "Kucing", "Meja"],
        answer: 1
      },
      {
        prompt: "Makhluk hidup membutuhkan … untuk minum.",
        options: ["Air", "Pasir", "Batu"],
        answer: 0
      }
    ]
  },
  {
    grade: 1,
    code: "b03",
    slug: "merawat-tubuh",
    title: "Merawat Tubuh dan Kebersihan",
    summary: "Membiasakan merawat tubuh dan menjaga kebersihan diri setiap hari.",
    objectives: [
      "Menjelaskan cara merawat tubuh setiap hari.",
      "Menyebutkan alat kebersihan dan kegunaannya.",
      "Menunjukkan kebiasaan hidup bersih."
    ],
    explorationTitle: "Mengamati Alat Kebersihan",
    explorationInstructions:
      "Amati gambar, lalu diskusikan alat kebersihan dan cara memakainya.",
    steps: [
      {
        prompt: "Alat apa yang dipakai untuk menjaga kebersihan?",
        reveal: "Sabun, sikat gigi, sampo, handuk, dan gunting kuku.",
        hint: "Alat ini ada di kamar mandi."
      },
      {
        prompt: "Kapan kita harus mencuci tangan?",
        reveal: "Sebelum makan, setelah bermain, dan setelah dari toilet.",
        hint: "Pakai sabun dan air mengalir."
      },
      {
        prompt: "Mengapa kita harus mandi setiap hari?",
        reveal: "Agar tubuh bersih, segar, dan terbebas dari kuman.",
        hint: "Kuman mudah menempel setelah bermain."
      },
      {
        prompt: "Apa yang kamu lakukan sebelum tidur?",
        reveal: "Menyikat gigi dan mencuci kaki supaya bersih.",
        hint: "Gigi disikat pagi dan malam."
      }
    ],
    practiceTitle: "Memasangkan Alat dan Kegunaannya",
    practiceInstructions: "Pasangkan setiap alat kebersihan dengan kegunaannya.",
    pairs: [
      ["Sabun", "Membersihkan tubuh"],
      ["Sikat gigi", "Membersihkan gigi"],
      ["Sampo", "Mencuci rambut"],
      ["Handuk", "Mengeringkan badan"],
      ["Gunting kuku", "Memotong kuku"],
      ["Sisir", "Merapikan rambut"]
    ],
    questions: [
      {
        prompt: "Alat apa yang dipakai untuk membersihkan gigi?",
        options: ["Sabun", "Sikat gigi", "Handuk"],
        answer: 1
      },
      {
        prompt: "Kita mencuci tangan dengan …",
        options: ["Air dan sabun", "Air kopi", "Minyak"],
        answer: 0
      }
    ]
  },
  {
    grade: 1,
    code: "b04",
    slug: "makanan-sehat",
    title: "Makanan dan Minuman Sehat",
    summary:
      "Mengenal makanan dan minuman sehat serta membiasakan pilihan yang aman.",
    objectives: [
      "Menyebutkan contoh makanan sehat.",
      "Menjelaskan alasan memilih minuman sehat.",
      "Menyebutkan akibat sering makan makanan manis."
    ],
    explorationTitle: "Mengamati Makanan Sehat",
    explorationInstructions:
      "Amati gambar, lalu diskusikan makanan dan minuman yang sehat.",
    steps: [
      {
        prompt: "Makanan apa yang sehat untuk tubuh?",
        reveal: "Sayur, buah, nasi, telur, dan ikan.",
        hint: "Pilih makanan yang tidak berminyak."
      },
      {
        prompt: "Minuman apa yang paling baik?",
        reveal: "Air putih. Air putih membuat tubuh tetap segar.",
        hint: "Minuman manis sebaiknya jarang diminum."
      },
      {
        prompt: "Apa akibat terlalu banyak makan makanan manis?",
        reveal: "Gigi bisa berlubang dan tubuh menjadi tidak sehat.",
        hint: "Gula berlebih tidak baik untuk gigi."
      },
      {
        prompt: "Sebutkan buah yang kamu suka.",
        reveal: "Misalnya pisang, pepaya, atau jeruk. Buah baik untuk tubuh.",
        hint: "Buah berwarna cerah biasanya banyak vitamin."
      }
    ],
    practiceTitle: "Memasangkan Makanan dan Jenisnya",
    practiceInstructions:
      "Pasangkan setiap makanan atau minuman dengan jenisnya.",
    pairs: [
      ["Air putih", "Minuman sehat"],
      ["Sayur", "Makanan sehat"],
      ["Permen", "Makanan manis"],
      ["Buah", "Camilan sehat"],
      ["Susu", "Minuman bergizi"],
      ["Gorengan", "Makanan berminyak"]
    ],
    questions: [
      {
        prompt: "Minuman yang paling baik untuk tubuh adalah …",
        options: ["Air putih", "Minuman soda", "Sirup manis"],
        answer: 0
      },
      {
        prompt: "Contoh makanan sehat adalah …",
        options: ["Sayur", "Permen", "Keripik"],
        answer: 0
      }
    ]
  },
  {
    grade: 1,
    code: "b05",
    slug: "cuaca-di-sekitarku",
    title: "Cuaca di Sekitarku",
    summary:
      "Mengenali cuaca cerah, berawan, dan hujan serta cara menyesuaikan diri.",
    objectives: [
      "Menyebutkan jenis cuaca.",
      "Menjelaskan tanda-tanda cuaca.",
      "Memilih pakaian dan kegiatan yang sesuai cuaca."
    ],
    explorationTitle: "Mengamati Cuaca",
    explorationInstructions:
      "Amati gambar, lalu jawab pertanyaan tentang cuaca hari ini.",
    steps: [
      {
        prompt: "Cuaca apa saja yang sering kamu lihat?",
        reveal: "Cerah, berawan, dan hujan.",
        hint: "Lihat langit dan awan."
      },
      {
        prompt: "Apa tanda cuaca akan hujan?",
        reveal: "Awan gelap, angin bertiup, dan udara terasa dingin.",
        hint: "Langit berwarna gelap."
      },
      {
        prompt: "Apa yang dibawa saat hujan?",
        reveal: "Payung atau jas hujan, dan pakaian yang hangat.",
        hint: "Supaya tubuh tetap kering."
      },
      {
        prompt: "Cuaca hari ini bagaimana? Sebutkan tanda yang kamu lihat.",
        reveal:
          "Jawaban sesuai pengamatan, misalnya cerah karena matahari bersinar.",
        hint: "Lihat keluar jendela."
      }
    ],
    practiceTitle: "Memasangkan Cuaca dan Ciri",
    practiceInstructions:
      "Pasangkan setiap cuaca atau benda dengan cirinya.",
    pairs: [
      ["Cerah", "Matahari bersinar"],
      ["Berawan", "Awan menutup langit"],
      ["Hujan", "Tetes air turun"],
      ["Payung", "Dibawa saat hujan"],
      ["Jaket", "Dipakai saat dingin"],
      ["Kipas", "Dipakai saat panas"]
    ],
    questions: [
      {
        prompt: "Apa yang kita bawa saat hujan?",
        options: ["Payung", "Kacamata renang", "Selimut"],
        answer: 0
      },
      {
        prompt: "Matahari bersinar terang. Cuaca saat itu adalah …",
        options: ["Hujan", "Cerah", "Berawan"],
        answer: 1
      }
    ]
  },
  {
    grade: 1,
    code: "b06",
    slug: "lingkungan-rumah-sekolah",
    title: "Lingkungan Rumah dan Sekolah",
    summary:
      "Mengenal ruangan di rumah dan sekolah serta menjaga kebersihannya.",
    objectives: [
      "Menyebutkan ruangan penting di rumah dan sekolah.",
      "Menjelaskan kegunaan tempat di rumah dan sekolah.",
      "Menunjukkan cara menjaga kebersihan lingkungan."
    ],
    explorationTitle: "Mengamati Lingkungan Rumah dan Sekolah",
    explorationInstructions:
      "Amati gambar, lalu diskusikan tempat di rumah dan sekolah serta kegunaannya.",
    steps: [
      {
        prompt: "Ruang apa saja yang ada di rumahmu?",
        reveal: "Kamar tidur, dapur, kamar mandi, dan ruang tamu.",
        hint: "Ingat denah rumahmu."
      },
      {
        prompt: "Tempat apa saja yang ada di sekolah?",
        reveal: "Kelas, perpustakaan, kantin, dan halaman.",
        hint: "Ingat sekolahmu."
      },
      {
        prompt: "Bagaimana menjaga lingkungan tetap bersih?",
        reveal: "Membuang sampah di tempat sampah dan menyapu lantai.",
        hint: "Jangan membiarkan sampah berserakan."
      },
      {
        prompt: "Di mana kamu membaca buku di sekolah?",
        reveal: "Di perpustakaan atau di kelas.",
        hint: "Ada rak buku di sana."
      }
    ],
    practiceTitle: "Memasangkan Tempat dan Kegunaannya",
    practiceInstructions: "Pasangkan setiap tempat dengan kegunaannya.",
    pairs: [
      ["Dapur", "Tempat memasak"],
      ["Kamar mandi", "Tempat mandi"],
      ["Perpustakaan", "Tempat membaca buku"],
      ["Kantin", "Tempat membeli makanan"],
      ["Kelas", "Tempat belajar"],
      ["Halaman", "Tempat bermain"]
    ],
    questions: [
      {
        prompt: "Di mana kita belajar di sekolah?",
        options: ["Kelas", "Dapur", "Kantin"],
        answer: 0
      },
      {
        prompt: "Sampah sebaiknya dibuang di …",
        options: ["Halaman", "Tempat sampah", "Sungai"],
        answer: 1
      }
    ]
  },
  {
    grade: 1,
    code: "b07",
    slug: "hewan-tumbuhan-peliharaan",
    title: "Hewan dan Tumbuhan Peliharaan",
    summary:
      "Mengenal hewan dan tumbuhan peliharaan serta cara merawatnya.",
    objectives: [
      "Menyebutkan contoh hewan dan tumbuhan peliharaan.",
      "Menjelaskan kebutuhan hewan dan tumbuhan peliharaan.",
      "Menunjukkan cara merawat peliharaan."
    ],
    explorationTitle: "Mengamati Peliharaan",
    explorationInstructions:
      "Amati gambar, lalu diskusikan cara merawat hewan dan tumbuhan peliharaan.",
    steps: [
      {
        prompt: "Hewan apa yang biasa dipelihara di rumah?",
        reveal: "Kucing, ayam, burung, dan ikan.",
        hint: "Hewan di sekitar rumahmu."
      },
      {
        prompt: "Tumbuhan apa yang bisa dipelihara?",
        reveal: "Tanaman hias, cabai, dan bunga.",
        hint: "Tumbuhan butuh air dan cahaya."
      },
      {
        prompt: "Apa kebutuhan hewan peliharaan?",
        reveal: "Makanan, air minum, dan tempat hidup yang bersih.",
        hint: "Beri makan setiap hari."
      },
      {
        prompt: "Apa yang terjadi jika tanaman tidak disiram?",
        reveal: "Tanaman menjadi layu karena kekurangan air.",
        hint: "Daunnya akan menggulung."
      }
    ],
    practiceTitle: "Memasangkan Peliharaan dan Ciri",
    practiceInstructions:
      "Pasangkan setiap hewan atau tumbuhan dengan cirinya.",
    pairs: [
      ["Kucing", "Suka susu"],
      ["Ikan", "Hidup di air"],
      ["Ayam", "Bertelur"],
      ["Tanaman", "Butuh disiram"],
      ["Bunga", "Butuh cahaya matahari"],
      ["Burung", "Hidup di kandang"]
    ],
    questions: [
      {
        prompt: "Hewan yang hidup di air adalah …",
        options: ["Ayam", "Ikan", "Kucing"],
        answer: 1
      },
      {
        prompt: "Tanaman peliharaan harus … setiap hari.",
        options: ["Disiram", "Dicabut", "Dipetik"],
        answer: 0
      }
    ]
  },
  {
    grade: 1,
    code: "b08",
    slug: "keselamatan-diri",
    title: "Keselamatan Diri",
    summary: "Mengenal bahaya di sekitar dan cara menjaga keselamatan diri.",
    objectives: [
      "Menyebutkan bahaya di rumah dan di jalan.",
      "Menjelaskan cara menjaga keselamatan diri.",
      "Meminta bantuan orang dewasa saat dalam bahaya."
    ],
    explorationTitle: "Mengamati Tempat Aman",
    explorationInstructions:
      "Amati gambar, lalu diskusikan cara menjaga keselamatan diri.",
    steps: [
      {
        prompt: "Bahaya apa yang ada di rumah?",
        reveal: "Kabel listrik, api kompor, dan benda tajam.",
        hint: "Jangan bermain dengan benda berbahaya."
      },
      {
        prompt: "Bagaimana cara menyeberang jalan dengan aman?",
        reveal:
          "Pegang tangan orang dewasa, lihat kanan dan kiri, lalu lewati zebra cross.",
        hint: "Tunggu sampai jalan sepi."
      },
      {
        prompt: "Apa yang dilakukan jika tersesat?",
        reveal:
          "Tetap di tempat yang aman dan minta bantuan orang dewasa.",
        hint: "Jangan pergi dengan orang asing."
      },
      {
        prompt: "Mengapa kita memakai helm saat bersepeda?",
        reveal: "Helm melindungi kepala jika terjatuh.",
        hint: "Kepala perlu dilindungi."
      }
    ],
    practiceTitle: "Memasangkan Benda dan Manfaatnya",
    practiceInstructions:
      "Pasangkan setiap benda dengan manfaat keselamatannya.",
    pairs: [
      ["Kabel listrik", "Bisa tersengat listrik"],
      ["Api kompor", "Bisa menyebabkan kebakaran"],
      ["Pisau", "Benda tajam"],
      ["Zebra cross", "Tempat menyeberang"],
      ["Helm", "Pelindung kepala"],
      ["Sabuk pengaman", "Pengaman di mobil"]
    ],
    questions: [
      {
        prompt: "Kita menyeberang jalan di …",
        options: ["Zebra cross", "Tengah jalan", "Jembatan"],
        answer: 0
      },
      {
        prompt: "Saat bersepeda, kepala dilindungi dengan …",
        options: ["Helm", "Topi ulang tahun", "Payung"],
        answer: 0
      }
    ]
  },
  {
    grade: 2,
    code: "b01",
    slug: "pertumbuhan-manusia-hewan",
    title: "Pertumbuhan Manusia dan Hewan",
    summary: "Mengenal perubahan tubuh manusia dan hewan ketika tumbuh.",
    objectives: [
      "Menjelaskan perubahan tubuh manusia saat tumbuh.",
      "Menyebutkan contoh hewan yang tumbuh besar.",
      "Mengurutkan tahap pertumbuhan sederhana."
    ],
    explorationTitle: "Mengamati Pertumbuhan",
    explorationInstructions:
      "Amati gambar, lalu diskusikan perubahan saat makhluk hidup tumbuh.",
    steps: [
      {
        prompt: "Bagaimana tubuhmu berubah sejak bayi?",
        reveal: "Bertambah tinggi, bertambah berat, dan semakin pandai.",
        hint: "Bandingkan foto bayi dengan dirimu sekarang."
      },
      {
        prompt: "Bagaimana anak kucing tumbuh?",
        reveal: "Menjadi lebih besar dan kuat, lalu bisa makan sendiri.",
        hint: "Hewan butuh waktu untuk tumbuh."
      },
      {
        prompt: "Apa yang dibutuhkan anak agar tumbuh sehat?",
        reveal: "Makanan bergizi, air, tidur cukup, dan olahraga.",
        hint: "Tidur cukup membantu tubuh tumbuh."
      },
      {
        prompt: "Sebutkan satu hal baru yang bisa kamu lakukan sekarang.",
        reveal:
          "Misalnya membaca, bersepeda, atau menulis. Itu tanda kamu tumbuh.",
        hint: "Ingat saat kamu masih kecil."
      }
    ],
    practiceTitle: "Memasangkan Anak dan Bentuk Dewasanya",
    practiceInstructions:
      "Pasangkan setiap anak hewan atau tumbuhan dengan bentuk dewasanya.",
    pairs: [
      ["Bayi", "Menjadi anak"],
      ["Anak kucing", "Menjadi kucing dewasa"],
      ["Anak ayam", "Menjadi ayam dewasa"],
      ["Pohon kecil", "Menjadi pohon besar"],
      ["Anak sapi", "Menjadi sapi dewasa"],
      ["Kepompong", "Menjadi kupu-kupu"]
    ],
    questions: [
      {
        prompt: "Anak yang tumbuh sehat makan makanan …",
        options: ["Bergizi", "Permen", "Keripik"],
        answer: 0
      },
      {
        prompt: "Makhluk yang tumbuh dari kecil menjadi besar adalah …",
        options: ["Batu", "Anak ayam", "Ember"],
        answer: 1
      }
    ]
  },
  {
    grade: 2,
    code: "b02",
    slug: "bagian-tumbuhan",
    title: "Bagian Tumbuhan dan Fungsinya",
    summary: "Mengenal akar, batang, daun, bunga, dan buah beserta fungsinya.",
    objectives: [
      "Menyebutkan bagian utama tumbuhan.",
      "Menjelaskan fungsi setiap bagian tumbuhan.",
      "Menemukan bagian tumbuhan di lingkungan sekitar."
    ],
    explorationTitle: "Mengamati Bagian Tumbuhan",
    explorationInstructions:
      "Amati gambar, lalu diskusikan bagian tumbuhan dan fungsinya.",
    steps: [
      {
        prompt: "Bagian apa saja yang ada pada tumbuhan?",
        reveal: "Akar, batang, daun, bunga, dan buah.",
        hint: "Lihat dari bawah ke atas."
      },
      {
        prompt: "Apa fungsi akar dan batang?",
        reveal: "Akar menyerap air dari tanah. Batang menopang tumbuhan.",
        hint: "Akar berada di dalam tanah."
      },
      {
        prompt: "Apa fungsi daun dan bunga?",
        reveal: "Daun membuat makanan. Bunga berkembang menjadi buah dan biji.",
        hint: "Daun berwarna hijau."
      },
      {
        prompt: "Bagian tumbuhan apa yang biasa kamu makan?",
        reveal: "Misalnya daun bayam, buah apel, atau akar wortel.",
        hint: "Sayur dan buah berasal dari bagian tumbuhan."
      }
    ],
    practiceTitle: "Memasangkan Bagian dan Fungsinya",
    practiceInstructions: "Pasangkan setiap bagian tumbuhan dengan fungsinya.",
    pairs: [
      ["Akar", "Menyerap air dari tanah"],
      ["Batang", "Menopang tubuh tumbuhan"],
      ["Daun", "Membuat makanan"],
      ["Bunga", "Berkembang menjadi buah"],
      ["Buah", "Berisi biji"],
      ["Tanah", "Tempat tumbuhan hidup"]
    ],
    questions: [
      {
        prompt: "Bagian tumbuhan yang menyerap air adalah …",
        options: ["Daun", "Akar", "Bunga"],
        answer: 1
      },
      {
        prompt: "Daun berwarna hijau berfungsi untuk …",
        options: ["Membuat makanan", "Menarik air", "Menyimpan batu"],
        answer: 0
      }
    ]
  },
  {
    grade: 2,
    code: "b03",
    slug: "siklus-hidup-sederhana",
    title: "Siklus Hidup Sederhana",
    summary: "Mengenal tahapan hidup kupu-kupu, ayam, dan tanaman.",
    objectives: [
      "Menyebutkan tahap hidup kupu-kupu.",
      "Mengurutkan tahap hidup tanaman.",
      "Menjelaskan bahwa makhluk hidup berkembang biak."
    ],
    explorationTitle: "Mengamati Siklus Hidup",
    explorationInstructions:
      "Amati gambar, lalu diskusikan tahapan hidup makhluk hidup.",
    steps: [
      {
        prompt: "Bagaimana kupu-kupu lahir?",
        reveal: "Dari telur, menjadi ulat, kepompong, lalu kupu-kupu.",
        hint: "Ada empat tahap."
      },
      {
        prompt: "Bagaimana ayam tumbuh?",
        reveal: "Dari telur menetas menjadi anak ayam, lalu ayam dewasa.",
        hint: "Ayam menetas dari telur."
      },
      {
        prompt: "Bagaimana tanaman baru tumbuh?",
        reveal: "Dari biji tumbuh tunas, tanaman muda, lalu tanaman berbunga.",
        hint: "Biji perlu air dan tanah."
      },
      {
        prompt: "Mengapa makhluk hidup berkembang biak?",
        reveal: "Supaya jenisnya tidak habis dan tetap ada.",
        hint: "Anak hewan berasal dari induknya."
      }
    ],
    practiceTitle: "Memasangkan Tahap dan Hasilnya",
    practiceInstructions:
      "Pasangkan setiap tahap hidup dengan tahap berikutnya.",
    pairs: [
      ["Telur", "Menetas menjadi ulat"],
      ["Ulat", "Menjadi kepompong"],
      ["Kepompong", "Menjadi kupu-kupu"],
      ["Biji", "Tumbuh menjadi tunas"],
      ["Tunas", "Menjadi tanaman muda"],
      ["Tanaman berbunga", "Menghasilkan biji baru"]
    ],
    questions: [
      {
        prompt: "Urutan hidup kupu-kupu yang benar adalah …",
        options: [
          "Telur, ulat, kepompong, kupu-kupu",
          "Ulat, telur, kupu-kupu, kepompong",
          "Kepompong, telur, ulat, kupu-kupu"
        ],
        answer: 0
      },
      {
        prompt: "Tanaman baru tumbuh dari …",
        options: ["Biji", "Batu", "Daun kering"],
        answer: 0
      }
    ]
  },
  {
    grade: 2,
    code: "b04",
    slug: "wujud-benda",
    title: "Wujud Benda Padat dan Cair",
    summary:
      "Membedakan benda padat dan benda cair melalui pengamatan sehari-hari.",
    objectives: [
      "Menyebutkan contoh benda padat dan cair.",
      "Menjelaskan sifat benda padat dan cair.",
      "Mengelompokkan benda berdasarkan wujudnya."
    ],
    explorationTitle: "Mengamati Wujud Benda",
    explorationInstructions:
      "Amati gambar, lalu diskusikan wujud benda di sekitarmu.",
    steps: [
      {
        prompt: "Benda apa yang bentuknya tetap?",
        reveal:
          "Batu, meja, dan buku tetap bentuknya walaupun dipindahkan.",
        hint: "Coba pegang benda padat."
      },
      {
        prompt: "Benda apa yang mengikuti bentuk wadahnya?",
        reveal: "Air dan sirup mengikuti bentuk wadahnya.",
        hint: "Tuang air ke dalam gelas."
      },
      {
        prompt: "Apa perbedaan benda padat dan benda cair?",
        reveal: "Benda padat bentuknya tetap, benda cair mengikuti wadah.",
        hint: "Bandingkan batu dan air."
      },
      {
        prompt: "Sebutkan benda cair di dapurmu.",
        reveal: "Air, minyak, dan kecap adalah benda cair.",
        hint: "Benda cair bisa dituang."
      }
    ],
    practiceTitle: "Memasangkan Benda dan Wujudnya",
    practiceInstructions: "Pasangkan setiap benda dengan wujudnya.",
    pairs: [
      ["Batu", "Benda padat"],
      ["Buku", "Benda padat"],
      ["Air", "Benda cair"],
      ["Susu", "Benda cair"],
      ["Meja", "Benda padat"],
      ["Sirup", "Benda cair"]
    ],
    questions: [
      {
        prompt: "Benda yang mengikuti bentuk wadah adalah …",
        options: ["Batu", "Air", "Buku"],
        answer: 1
      },
      {
        prompt: "Contoh benda padat adalah …",
        options: ["Meja", "Susu", "Air"],
        answer: 0
      }
    ]
  },
  {
    grade: 2,
    code: "b05",
    slug: "perubahan-cuaca-musim",
    title: "Perubahan Cuaca dan Musim",
    summary:
      "Mengenal perubahan cuaca serta musim hujan dan kemarau di Indonesia.",
    objectives: [
      "Membedakan cuaca dan musim.",
      "Menyebutkan ciri musim hujan dan kemarau.",
      "Menjelaskan kegiatan yang sesuai pada setiap musim."
    ],
    explorationTitle: "Mengamati Musim",
    explorationInstructions:
      "Amati gambar, lalu diskusikan perubahan cuaca dan musim.",
    steps: [
      {
        prompt: "Apa dua musim di Indonesia?",
        reveal: "Musim hujan dan musim kemarau.",
        hint: "Perhatikan curah hujan."
      },
      {
        prompt: "Apa ciri musim hujan?",
        reveal: "Sering turun hujan, udara lembap, dan banyak genangan air.",
        hint: "Bawa payung ke sekolah."
      },
      {
        prompt: "Apa ciri musim kemarau?",
        reveal: "Jarang turun hujan, udara panas, dan tanah menjadi kering.",
        hint: "Hemat air saat kemarau."
      },
      {
        prompt: "Kegiatan apa yang cocok saat musim hujan?",
        reveal:
          "Misalnya membaca buku di rumah atau memakai jas hujan ke sekolah.",
        hint: "Pilih kegiatan yang tetap aman."
      }
    ],
    practiceTitle: "Memasangkan Musim dan Cirinya",
    practiceInstructions:
      "Pasangkan setiap musim atau benda dengan cirinya.",
    pairs: [
      ["Musim hujan", "Sering turun hujan"],
      ["Musim kemarau", "Tanah menjadi kering"],
      ["Payung", "Dibawa saat hujan"],
      ["Jas hujan", "Melindungi tubuh dari air"],
      ["Kipas", "Dipakai saat udara panas"],
      ["Air hujan", "Mengisi sumur dan sungai"]
    ],
    questions: [
      {
        prompt: "Musim di Indonesia adalah …",
        options: [
          "Musim hujan dan kemarau",
          "Musim salju dan gugur",
          "Musim semi dan panas"
        ],
        answer: 0
      },
      {
        prompt: "Saat musim kemarau kita harus …",
        options: ["Hemat air", "Bermain di genangan", "Memakai jas hujan"],
        answer: 0
      }
    ]
  },
  {
    grade: 2,
    code: "b06",
    slug: "sumber-daya-alam",
    title: "Sumber Daya Alam di Sekitar",
    summary:
      "Mengenal sumber daya alam di sekitar dan cara memakainya dengan bijak.",
    objectives: [
      "Menyebutkan contoh sumber daya alam.",
      "Membedakan sumber daya alam yang dapat diperbarui dan tidak.",
      "Menjelaskan cara menghemat sumber daya alam."
    ],
    explorationTitle: "Mengamati Sumber Daya Alam",
    explorationInstructions:
      "Amati gambar, lalu diskusikan sumber daya alam di sekitarmu.",
    steps: [
      {
        prompt: "Sumber daya alam apa yang ada di sekitar?",
        reveal: "Air, tanah, tumbuhan, hewan, dan sinar matahari.",
        hint: "Semua berasal dari alam."
      },
      {
        prompt: "Mana yang dapat diperbarui?",
        reveal:
          "Tumbuhan, hewan, air, dan sinar matahari dapat diperbarui.",
        hint: "Bisa tumbuh atau tersedia kembali."
      },
      {
        prompt: "Bagaimana menghemat sumber daya alam?",
        reveal:
          "Hemat air, tidak menebang pohon sembarangan, dan membuang sampah pada tempatnya.",
        hint: "Gunakan secukupnya."
      },
      {
        prompt: "Sebutkan satu sumber daya alam di sekolahmu.",
        reveal: "Air di keran, pohon di halaman, atau sinar matahari.",
        hint: "Lihat di sekitar halaman."
      }
    ],
    practiceTitle: "Memasangkan Sumber Daya dan Manfaatnya",
    practiceInstructions:
      "Pasangkan setiap sumber daya alam dengan manfaatnya.",
    pairs: [
      ["Air", "Untuk minum dan mencuci"],
      ["Tanah", "Tempat tumbuh tanaman"],
      ["Sinar matahari", "Sumber energi dan panas"],
      ["Pohon", "Sumber kayu dan oksigen"],
      ["Batu bara", "Tidak dapat diperbarui"],
      ["Ikan", "Dapat diperbarui"]
    ],
    questions: [
      {
        prompt: "Contoh sumber daya alam yang dapat diperbarui adalah …",
        options: ["Pohon", "Batu bara", "Minyak bumi"],
        answer: 0
      },
      {
        prompt: "Cara menghemat air adalah …",
        options: [
          "Mematikan keran setelah dipakai",
          "Membiarkan keran terbuka",
          "Bermain air seharian"
        ],
        answer: 0
      }
    ]
  },
  {
    grade: 2,
    code: "b07",
    slug: "hemat-air-listrik",
    title: "Hemat Air dan Listrik",
    summary: "Membiasakan menghemat air dan listrik di rumah dan di sekolah.",
    objectives: [
      "Menjelaskan kegunaan air dan listrik.",
      "Menyebutkan cara menghemat air dan listrik.",
      "Menunjukkan kebiasaan hemat energi."
    ],
    explorationTitle: "Mengamati Penggunaan Air dan Listrik",
    explorationInstructions:
      "Amati gambar, lalu diskusikan cara menghemat air dan listrik.",
    steps: [
      {
        prompt: "Untuk apa kita memakai air?",
        reveal: "Untuk minum, mandi, mencuci, dan memasak.",
        hint: "Air bersih harus dijaga."
      },
      {
        prompt: "Untuk apa kita memakai listrik?",
        reveal: "Untuk menyalakan lampu, kipas angin, dan televisi.",
        hint: "Listrik membantu pekerjaan."
      },
      {
        prompt: "Bagaimana menghemat air dan listrik?",
        reveal:
          "Tutup keran setelah dipakai, matikan lampu saat siang, dan cabut pengisi daya setelah selesai.",
        hint: "Matikan yang tidak dipakai."
      },
      {
        prompt: "Sebutkan satu cara menghemat listrik di kelasmu.",
        reveal:
          "Mematikan lampu dan kipas angin saat jam pelajaran selesai.",
        hint: "Jangan biarkan alat menyala tanpa dipakai."
      }
    ],
    practiceTitle: "Memasangkan Tindakan dan Manfaatnya",
    practiceInstructions:
      "Pasangkan setiap benda atau tindakan dengan manfaatnya.",
    pairs: [
      ["Keran", "Ditutup setelah dipakai"],
      ["Lampu", "Dimatikan saat tidak dipakai"],
      ["Kipas angin", "Dimatikan saat kelas kosong"],
      ["Pengisi daya", "Dicabut setelah selesai"],
      ["Air hujan", "Ditampung untuk menyiram"],
      ["Ember", "Menghemat air saat mencuci"]
    ],
    questions: [
      {
        prompt: "Setelah memakai keran, kita harus …",
        options: ["Menutupnya", "Membiarkannya terbuka", "Membukanya lebih besar"],
        answer: 0
      },
      {
        prompt: "Lampu sebaiknya dimatikan saat …",
        options: ["Tidak dipakai", "Sedang belajar", "Malam hari"],
        answer: 0
      }
    ]
  },
  {
    grade: 2,
    code: "b08",
    slug: "lingkungan-bersih-sehat",
    title: "Lingkungan Bersih dan Sehat",
    summary: "Menjaga kebersihan lingkungan rumah dan sekolah agar tetap sehat.",
    objectives: [
      "Menyebutkan ciri lingkungan bersih dan kotor.",
      "Menjelaskan akibat lingkungan kotor.",
      "Menunjukkan cara menjaga lingkungan bersama."
    ],
    explorationTitle: "Mengamati Lingkungan Bersih",
    explorationInstructions:
      "Amati gambar, lalu diskusikan ciri lingkungan bersih dan kotor.",
    steps: [
      {
        prompt: "Apa ciri lingkungan bersih?",
        reveal: "Sampah ada di tempatnya, lantai bersih, dan udara segar.",
        hint: "Lihat sekelilingmu."
      },
      {
        prompt: "Apa akibat lingkungan kotor?",
        reveal: "Banyak lalat dan nyamuk, bau tidak sedap, dan mudah sakit.",
        hint: "Sampah menumpuk berbahaya."
      },
      {
        prompt: "Bagaimana menjaga lingkungan bersama?",
        reveal:
          "Kerja bakti, membuang sampah pada tempatnya, dan menanam pohon.",
        hint: "Lingkungan dijaga bersama-sama."
      },
      {
        prompt: "Apa yang kamu lakukan jika melihat sampah di halaman?",
        reveal: "Memungutnya dan membuangnya ke tempat sampah.",
        hint: "Mulai dari diri sendiri."
      }
    ],
    practiceTitle: "Memasangkan Benda dan Kegunaannya",
    practiceInstructions:
      "Pasangkan setiap benda atau kegiatan dengan kegunaannya.",
    pairs: [
      ["Tempat sampah", "Tempat membuang sampah"],
      ["Sapu", "Membersihkan lantai"],
      ["Kerja bakti", "Membersihkan bersama-sama"],
      ["Genangan air", "Sarang nyamuk"],
      ["Pohon", "Membuat udara segar"],
      ["Cuci tangan", "Mencegah penyakit"]
    ],
    questions: [
      {
        prompt: "Sampah yang dibiarkan menumpuk menjadi sarang …",
        options: ["Nyamuk", "Kupu-kupu", "Burung"],
        answer: 0
      },
      {
        prompt: "Lingkungan bersih membuat tubuh …",
        options: ["Sehat", "Sakit", "Lemah"],
        answer: 0
      }
    ]
  }
];

function packageId(topic) {
  return `kelas${topic.grade}-ipas-${topic.code}-${topic.slug}`;
}

function manifest(topic, asset) {
  return {
    manifestVersion: 1,
    packageId: packageId(topic),
    packageVersion: "0.2.0",
    schemaVersion: "1.0.0",
    title: `${topic.title} — IPAS Kelas ${topic.grade} (Draft)`,
    locale: "id-ID",
    gradeLevels: [topic.grade],
    subjects: ["ipas"],
    curriculumRefs: [
      { framework: "kurikulum-merdeka", id: "fase-a", version: "2024" }
    ],
    assets: [asset],
    dependencies: [],
    signature: null,
    releaseState: "draft"
  };
}

function exploration(topic, assetPath) {
  return {
    activityId: `eksplorasi-${topic.slug}`,
    type: "exploration",
    schemaVersion: "1.0.0",
    title: topic.explorationTitle,
    instructions: topic.explorationInstructions,
    assets: [assetPath],
    interactionConfig: {
      steps: [
        ...topic.steps.slice(0, 3).map((step) => ({
          prompt: step.prompt,
          assetPath,
          altText: ASSET_ALT,
          reveal: step.reveal,
          hint: step.hint
        })),
        {
          prompt: `Apa hal penting yang kamu pelajari tentang ${topic.title}?`,
          reveal: topic.summary,
          hint: "Baca kembali ringkasan pelajaran.",
          assetPath,
          altText: ASSET_ALT
        },
        {
          prompt: topic.steps[3].prompt,
          reveal: topic.steps[3].reveal,
          hint: topic.steps[3].hint,
          assetPath,
          altText: ASSET_ALT
        }
      ]
    },
    completionPolicy: { type: "view" },
    feedbackPolicy: {
      mode: "immediate",
      allowRetry: true,
      showCorrectAnswer: true
    },
    runtimeCapabilities: ["touch", "keyboard"],
    accessibilityMetadata: { altText: ASSET_ALT }
  };
}

function matching(topic) {
  return {
    activityId: `matching-${topic.slug}`,
    type: "matching",
    schemaVersion: "1.0.0",
    title: topic.practiceTitle,
    instructions: topic.practiceInstructions,
    assets: [],
    interactionConfig: {
      pairs: topic.pairs.map(([left, right], index) => ({
        pairId: `pasangan-${topic.slug}-${index + 1}`,
        left,
        right
      }))
    },
    completionPolicy: { type: "view" },
    feedbackPolicy: {
      mode: "immediate",
      allowRetry: true,
      showCorrectAnswer: true
    },
    runtimeCapabilities: ["touch", "keyboard"],
    accessibilityMetadata: { altText: ASSET_ALT }
  };
}

function quiz(topic) {
  return {
    activityId: `kuis-${topic.slug}`,
    type: "multiple-choice",
    schemaVersion: "1.0.0",
    title: `Kuis Penguatan: ${topic.title}`,
    instructions: "Pilih jawaban yang paling tepat.",
    assets: [],
    interactionConfig: { layout: "single-question" },
    assessmentConfig: {
      questions: topic.questions.map((question, questionIndex) => ({
        questionId: `soal-${topic.slug}-${questionIndex + 1}`,
        prompt: question.prompt,
        responseType: "single-choice",
        options: question.options.map((text, optionIndex) => ({
          optionId: `opsi-${topic.slug}-${questionIndex + 1}-${optionIndex + 1}`,
          text
        })),
        correctResponse: `opsi-${topic.slug}-${questionIndex + 1}-${
          question.answer + 1
        }`
      })),
      passingScore: 75
    },
    completionPolicy: { type: "score-threshold", threshold: 75 },
    feedbackPolicy: {
      mode: "after-attempt",
      allowRetry: true,
      showCorrectAnswer: false
    },
    runtimeCapabilities: ["touch", "keyboard"],
    accessibilityMetadata: { altText: ASSET_ALT }
  };
}

function lesson(topic, assetPath) {
  return {
    lessonId: topic.slug,
    packageId: packageId(topic),
    title: topic.title,
    summary: topic.summary,
    curriculumRefs: [],
    learningObjectives: topic.objectives,
    activityIds: [
      `eksplorasi-${topic.slug}`,
      `matching-${topic.slug}`,
      `kuis-${topic.slug}`
    ],
    assessmentRefs: [`kuis-${topic.slug}`],
    assetRefs: [assetPath],
    accessibilityMetadata: { altText: ASSET_ALT },
    contentVersion: "0.2.0",
    reviewStatus: "draft"
  };
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

const coverBytes = readFileSync(COVER_SOURCE);
const asset = {
  mediaType: "image/webp",
  sizeBytes: coverBytes.length,
  sha256: createHash("sha256").update(coverBytes).digest("hex")
};

const force = process.argv.includes("--force");
let written = 0;
let skipped = 0;

for (const topic of topics) {
  const id = packageId(topic);
  const dir = path.join(PACKAGES_ROOT, id);
  if (existsSync(dir) && !force) {
    skipped += 1;
    console.log(`skip (sudah ada): ${id}`);
    continue;
  }

  const assetPath = `assets/${topic.slug}.webp`;
  mkdirSync(path.join(dir, "lessons"), { recursive: true });
  mkdirSync(path.join(dir, "activities"), { recursive: true });
  mkdirSync(path.join(dir, "assets"), { recursive: true });

  writeFileSync(path.join(dir, assetPath), coverBytes);
  writeJson(path.join(dir, "manifest.json"), manifest(topic, { path: assetPath, ...asset }));
  writeJson(path.join(dir, "lessons", "lesson-001.json"), lesson(topic, assetPath));
  writeJson(path.join(dir, "activities", "activity-001.json"), exploration(topic, assetPath));
  writeJson(path.join(dir, "activities", "activity-002.json"), matching(topic));
  writeJson(path.join(dir, "activities", "activity-003.json"), quiz(topic));
  written += 1;
  console.log(`tulis: ${id}`);
}

console.log(`selesai: ${written} paket ditulis, ${skipped} dilewati.`);
