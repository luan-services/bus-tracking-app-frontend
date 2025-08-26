import { PublicNavbar } from "@/components/main_pages/main_nav/PublicNavbar";
import { PublicFooter } from "@/components/main_pages/main_nav/PublicFooter";

export default function PublicLayout({children}: {children: React.ReactNode;}) {
	return (
		<>
			<PublicNavbar/>
			<main className="min-h-screen w-full justify-center flex">
				{children}
			</main>
			<PublicFooter/>
		</>
  );
}