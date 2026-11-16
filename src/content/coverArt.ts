const gradeCoverUrls = import.meta.glob("../../content/covers/kelas/cover-kelas-*.webp", {
  eager: true,
  query: "?url",
  import: "default"
}) as Record<string, string>;

const subjectCoverUrls = import.meta.glob("../../content/covers/pelajaran/cover-mapel-*.webp", {
  eager: true,
  query: "?url",
  import: "default"
}) as Record<string, string>;

export function gradeCoverUrl(grade: number): string | null {
  return gradeCoverUrls[`../../content/covers/kelas/cover-kelas-${grade}.webp`] ?? null;
}

export function subjectCoverUrl(subject: string): string | null {
  return subjectCoverUrls[`../../content/covers/pelajaran/cover-mapel-${subject}.webp`] ?? null;
}
