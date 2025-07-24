import { redirect } from 'next/navigation';
import { fetchFromServer } from '@/lib/api';
import type { User } from '@/types/index.ts';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { LogoutButton } from '@/components/general_components/LogoutButton';

// este é o layout principal do dashboard. Atua como o primeiro portão de segurança.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	// usa nossa função de servidor para buscar os dados do usuário
	const response = await fetchFromServer('/api/users/current/me');

	// se a resposta não for OK (mesmo após a tentativa de refresh), o token não é válido, redireciona para /login
	if (!response.ok) {
		redirect('/login');
	}
	const user: User = await response.json();

	// se for um usuário comum, mostra a tela de acesso negado.
	if (user.role === 'user') {
		return (
			<div className="flex min-h-screen w-full font-roboto items-center justify-center bg-white sm:bg-gray-100">
      			<div className="p-8 flex flex-col text-center items-center gap-4 bg-white sm:border-1 border-gray-200 sm:rounded-lg sm:shadow-md w-full max-w-96">
       				<h1 className="text-3xl font-bold text-red-500">Acesso Negado</h1>
        			<p className="text-gray-700">Você não tem permissão para acessar essa área. Contate um administrador.</p>
					<LogoutButton useConfirmScreen={false}>Sair</LogoutButton>
      			</div>
    		</div>
		)
	}

	// se passou nas verificações, renderiza a estrutura da dashboard.
	return (
		<div className="flex md:flex-row min-h-screen w-full font-roboto bg-white md:bg-gray-100 pb-[44px] md:pb-0"> {/* pb = tamanho do nav (serve para impedir que o txt das paginas fiquem presos atras do nav */}
			{/* Passa os dados do usuário para a barra de navegação para ela saber quais botões mostrar */}
			<DashboardNav user={user} />
			<main className="flex w-full md:p-10">{children}</main>
		</div>
	);
}