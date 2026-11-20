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
    // Oscuro: transparente para mostrar el campo texturizado del body.
    dark: "text-efa-bone",
    light: "bg-efa-bone text-efa-ink",
  };
  return (
    <section className={`${tones[tone]} py-16 sm:py-24 ${className}`}>
      {children}
    </section>
  );
}
