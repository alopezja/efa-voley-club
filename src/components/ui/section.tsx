export function Section({
  tone = "dark",
  className = "",
  children,
}: {
  tone?: "dark" | "light";
  className?: string;
  children: React.ReactNode;
}) {
  const tones = {
    dark: "bg-efa-ink text-efa-bone",
    light: "bg-efa-bone text-efa-ink",
  };
  return (
    <section className={`${tones[tone]} py-16 sm:py-24 ${className}`}>
      {children}
    </section>
  );
}
