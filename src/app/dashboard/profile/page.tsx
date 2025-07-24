import { redirect } from 'next/navigation';
import { fetchFromServer } from '@/lib/api';
import type { User } from '@/types/index.ts';

export default async function ProfilePage() {
	// a proteção já foi feita pelos layouts. Aqui só buscamos os dados para exibir.
	const response = await fetchFromServer('/api/users/current/me');
	if (!response.ok) {
		redirect('/login');
	}
	const user: User = await response.json();

	return (
		<div className="flex flex-col w-full bg-green-500 p-4 md:p-8 gap-4 md:max-w-120 md:shadow-md">
			<h2 className="font-bold text-3xl">Olá, {user.name}.</h2>
			<hr className="h-px bg-gray-300 border-0"></hr>

			<div className="flex flex-col gap-1 max-w-88 text-sm">
				<div className="flex flex-wrap justify-between">
					<span className="font-bold w-40">Nome Completo</span>
					<span className=" w-40">{user.name} {user.last_name}</span>
				</div>
				<div className="flex flex-wrap justify-between">
					<span className="font-bold w-40">Email</span>
					<span className=" w-40">{user.email}</span>
				</div>
				<div className="flex flex-wrap justify-between mb-4">
					<span className="font-bold w-40">CPF</span>
					<span className=" w-40">{user.cpf}</span>
				</div>
				<div className="flex flex-wrap justify-between">
					<span className="font-bold w-40">Matrícula</span>
					<span className=" w-40">{user.code}</span>
				</div>
				<div className="flex flex-wrap justify-between">
					<span className="font-bold w-40">Função</span>
					<span className=" w-40">{user.role}</span>
				</div>
			</div>
		</div>
	);
}