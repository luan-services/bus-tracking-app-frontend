import { PublicNavbar } from "@/components/public_pages/PublicNavbar";
import { PublicFooter } from "@/components/public_pages/PublicFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNavbar />
      <main className="h-full container mx-auto px-4 py-8">
        {children}
      </main>
      <PublicFooter />
    </>
  );
}