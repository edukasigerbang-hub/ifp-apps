const subjectLabels: Record<string, string> = {
  pai: "PAI",
  "pendidikan-pancasila": "Pendidikan Pancasila",
  "bahasa-indonesia": "Bahasa Indonesia",
  matematika: "Matematika",
  ipas: "IPAS",
  pjok: "PJOK",
  "seni-rupa": "Seni Rupa"
};

export function subjectLabel(subject: string): string {
  const key = subject.trim().toLowerCase();
  const known = subjectLabels[key];
  if (known) {
    return known;
  }
  return key
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
