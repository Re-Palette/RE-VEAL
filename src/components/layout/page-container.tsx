import { cn } from "@/lib/utils";

/**
 * One container for every page. Desktop-first: comfortable at 1440px, still
 * uses the space at 1920px, and never runs edge-to-edge on a phone.
 */
export function PageContainer({
  className,
  wide = false,
  children,
}: {
  className?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10",
        wide ? "max-w-[1760px]" : "max-w-[1480px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-5">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-30">{eyebrow}</p>
        )}
        <h1 className="font-display text-[26px] font-semibold tracking-[-0.03em] sm:text-3xl lg:text-[34px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2.5 max-w-3xl text-[15px] leading-relaxed text-ink-50">{description}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </header>
  );
}
