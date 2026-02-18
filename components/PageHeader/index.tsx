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
      <h1 className="text-3xl font-bold tracking-tight md:text-5xl text-text-primary font-inter">
        {title}
      </h1>

      {lead && (
          <p className="mx-auto max-w-[600px] text-text-secondary text-lg font-bold lg:text-xl">
          {lead}
        </p>
      )}

      {/* <div className="max-w-lg mx-auto">
        <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />
      </div> */}

      {disclaimer && (
        <p className="mx-auto italic max-w-[500px] text-text-tertiary md:text-sm">
          {disclaimer}
        </p>
      )}
    </section>
  );
}
// ...existing code...