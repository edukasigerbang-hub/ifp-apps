export type ScreenId =
  | "home"
  | "curriculum"
  | "activities"
  | "player"
  | "results"
  | "content"
  | "license"
  | "settings";

export interface NavItem {
  id: ScreenId;
  label: string;
  description: string;
  planned: string[];
  group: "belajar" | "kelola";
}

export const navigationItems: NavItem[] = [
  {
    id: "home",
    label: "Beranda",
    description: "Titik masuk pembelajaran pada perangkat ini.",
    planned: ["Rekomendasi dan lanjutkan belajar", "Ringkasan progres lokal", "Akses cepat ke aktivitas"],
    group: "belajar"
  },
  {
    id: "curriculum",
    label: "Jelajah Materi",
    description: "Menemukan materi berdasarkan kelas dan mata pelajaran.",
    planned: ["Filter kelas dan mata pelajaran", "Pencarian", "Kartu materi dengan status ketersediaan"],
    group: "belajar"
  },
  {
    id: "activities",
    label: "Aktivitas Interaktif",
    description: "Menemukan game, kuis, dan aktivitas berbasis tindakan.",
    planned: ["Kartu aktivitas per jenis", "Durasi dan kebutuhan perangkat", "Mulai aktivitas"],
    group: "belajar"
  },
  {
    id: "player",
    label: "Player Pembelajaran",
    description: "Menjalankan materi dan asesmen dalam sesi belajar.",
    planned: ["Area konten aktivitas", "Kontrol langkah dan jawaban", "Feedback dan progres sesi"],
    group: "belajar"
  },
  {
    id: "results",
    label: "Hasil Belajar",
    description: "Meninjau progres dan hasil pada perangkat.",
    planned: ["Ringkasan progres", "Aktivitas terbaru", "Ekspor laporan dasar"],
    group: "belajar"
  },
  {
    id: "content",
    label: "Konten & Pembaruan",
    description: "Mengelola paket konten lokal dan pembaruan.",
    planned: ["Daftar paket dan versi", "Impor paket lokal", "Validasi, aktivasi, dan rollback"],
    group: "kelola"
  },
  {
    id: "license",
    label: "Lisensi Perangkat",
    description: "Melihat dan mengelola status lisensi perangkat.",
    planned: ["Status dari Native License Manager", "Aktivasi online dan offline", "Pengajuan transfer perangkat"],
    group: "kelola"
  },
  {
    id: "settings",
    label: "Pengaturan",
    description: "Preferensi tampilan, audio, dan diagnostik.",
    planned: ["Preferensi tampilan dan audio", "Informasi perangkat", "Ekspor diagnostik"],
    group: "kelola"
  }
];

export function findNavItem(id: ScreenId): NavItem {
  const item = navigationItems.find((entry) => entry.id === id);
  if (!item) {
    throw new Error(`Unknown screen: ${id}`);
  }
  return item;
}
