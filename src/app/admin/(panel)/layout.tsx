import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: "Panel de administración",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <div className="flex min-h-screen flex-col bg-efa-ink text-efa-bone md:flex-row">
      <AdminNav email={user.email} />
      <div className="flex-1 p-4 sm:p-8">{children}</div>
    </div>
  );
}
