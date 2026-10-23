import type { NavItem } from "../navigation";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";

interface ScreenPlaceholderProps {
  item: NavItem;
}

export function ScreenPlaceholder({ item }: ScreenPlaceholderProps) {
  return (
    <>
      <PageHeader title={item.label} description={item.description} />

      <section className="mt-6 max-w-3xl rounded-card border border-ink/10 bg-surface p-6 md:p-8">
        <StatusBadge tone="neutral" label="Scaffold Fase C" />
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Layar ini belum diimplementasikan. Kontrak data, status pemrosesan, dan aksi
          akan ditambahkan pada fase berikutnya. Tidak ada data produksi di halaman ini.
        </p>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-muted">
          Cakupan yang direncanakan
        </h2>
        <ul className="mt-3 space-y-2">
          {item.planned.map((entry) => (
            <li key={entry} className="flex items-start gap-3 text-sm text-ink">
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal"
              />
              {entry}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
