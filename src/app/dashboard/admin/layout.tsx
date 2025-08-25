import { redirect } from 'next/navigation';
import { fetchFromServer } from '@/lib/api-server';
import type { User } from '@/types/index.ts';

// Este layout envolve TODAS as páginas dentro de /admin. Atua como o segundo portão.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	// Busca os dados do usuário novamente. O Next.js otimiza chamadas idênticas.
	const response = await fetchFromServer('/api/users/current/me');
	// se a resposta não for OK (mesmo após a tentativa de refresh), o token não é válido, redireciona para /login
	if (!response.ok) {
		redirect('/login');
	}
	const user: User = await response.json();

	// se o usuário não for 'admin', acesso negado.
	if (user.role !== 'admin') {
		return (
		<div className="flex flex-1 w-full h-full font-roboto items-center justify-center bg-white sm:bg-gray-100">
			<div className="p-8 flex flex-col text-center items-center gap-4 bg-white md:border-1 border-gray-200 md:rounded-lg md:shadow-md w-full max-w-96">
				<h1 className="text-3xl font-bold text-red-500">Acesso Negado</h1>
				<p className="text-gray-700">Você não tem acesso à essa página.</p>
			</div>
		</div>
		)
	}

	// Se for admin, simplesmente renderiza a página filha solicitada.
	return <>{children}</>;
}