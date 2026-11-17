import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Eso Fue Adentro Voley Club",
  url: "https://efavoleyclub.com",
  logo: "https://efavoleyclub.com/brand/efa-logo.jpg",
  sameAs: [] as string[],
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
