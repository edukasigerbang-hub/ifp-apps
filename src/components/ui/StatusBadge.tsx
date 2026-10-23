export type StatusTone = "positive" | "warning" | "neutral";

const toneClasses: Record<StatusTone, string> = {
  positive: "bg-teal/10 text-[#0e7f78]",
  warning: "bg-warning/15 text-[#8a5a12]",
  neutral: "bg-ink/5 text-muted"
};

interface StatusBadgeProps {
  tone?: StatusTone;
  label: string;
  title?: string;
}

export function StatusBadge({ tone = "neutral", label, title }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex min-h-7 items-center gap-2 rounded-full px-3 text-xs font-semibold ${toneClasses[tone]}`}
      title={title}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
