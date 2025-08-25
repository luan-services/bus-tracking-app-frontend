import { PublicNavbar } from "@/components/main_pages/main_nav/PublicNavbar";
import { PublicFooter } from "@/components/main_pages/main_nav/PublicFooter";

export default function PublicLayout({children}: {children: React.ReactNode;}) {
	return (
		<>
			<PublicNavbar/>
			<main className="min-h-screen container mx-auto px-4 py-8">
				{children}
			</main>
			<PublicFooter/>
		</>
  );
}