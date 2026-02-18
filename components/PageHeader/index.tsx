// ...existing code...
export default function SectionHeader({
  title,
  lead,
  disclaimer,
  className = "",
}: {
  title: string;
  lead?: string;
  disclaimer?: string;
  className?: string;
}) {
  return (
    <section className={`text-center space-y-4 mb-12 ${className}`}>
      <h1 className="type-title tracking-tight md:text-5xl text-(--color-text-primary)">
        {title}
      </h1>

      {lead && (
          <p className="type-subtitle mx-auto max-w-150 text-(--color-text-secondary) lg:text-xl">
          {lead}
        </p>
      )}

      {/* <div className="max-w-lg mx-auto">
        <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />
      </div> */}

      {disclaimer && (
        <p className="type-caption mx-auto italic max-w-125 text-(--color-text-tertiary)">
          {disclaimer}
        </p>
      )}
    </section>
  );
}
// ...existing code...