import { redirect } from 'next/navigation';
import { fetchFromServer } from '@/lib/api-server';
import type { User } from '@/types/index.ts';

export default async function ProfilePage() {
	// a proteção já foi feita pelos layouts. Aqui só buscamos os dados para exibir.
	const response = await fetchFromServer('/api/users/current/me');
	if (!response.ok) {
		redirect('/login');
	}
	const user: User = await response.json();

	return (
		<div className="w-full justify-center flex items-center h-full p-2">
			<div className="flex flex-col bg-white border-1 border-gray-300 p-4 md:p-8 gap-4 max-w-120 w-full h-full rounded-lg shadow-xs">
				<label className="text-2xl font-bold text-gray-900">Olá, {user.name}.</label>
				<span className="text-gray-500 border-t border-gray-300"></span>

				<div className="px-2 flex flex-wrap justify-between text-md">
					<span className="font-bold w-48">Nome Completo</span>
					<span className=" w-48">{user.name} {user.last_name}</span>
				</div>

				<div className="px-2 flex flex-wrap justify-between text-md">
					<span className="font-bold w-48">Email</span>
					<span className=" w-48">{user.email}</span>
				</div>

				<div className="px-2 flex flex-wrap justify-between text-md">
					<span className="font-bold w-48">CPF</span>
					<span className=" w-48">{user.cpf}</span>
				</div>

				<div className="px-2 flex flex-wrap justify-between text-md">
					<span className="font-bold w-48">Matrícula</span>
					<span className=" w-48">{user.code}</span>
				</div>

				<div className="px-2 flex flex-wrap justify-between text-md">
				<span className="font-bold w-48">Função</span>
				<span className=" w-48">{user.role == 'driver' ? 'Motorista' : user.role == 'admin' ? 'Administrador' : 'None'}</span>
				</div>


			</div>
		</div>
	);
}
