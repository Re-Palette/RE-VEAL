/** Shown while a filter-driven listing streams in. */
export function ListingSkeleton({ cards = 8 }: { cards?: number }) {
  return (
    <div className="mx-auto w-full max-w-[1760px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="shimmer-line h-9 w-56 rounded-full" />
      <div className="mt-3 shimmer-line h-5 w-96 max-w-full rounded-full" />
      <div className="mt-7 shimmer-line h-44 rounded-panel" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="shimmer-line h-72 rounded-card" />
        ))}
      </div>
    </div>
  );
}
