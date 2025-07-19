import { redirect } from 'next/navigation';
import { fetchFromServer } from '@/lib/api';
import type { User } from '@/types/index.ts';

export default async function ProfilePage() {
  // A proteção já foi feita pelos layouts. Aqui só buscamos os dados para exibir.
  const response = await fetchFromServer('/api/users/current/me');
  if (!response.ok) {
    redirect('/login');
  }
  const user: User = await response.json();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Meu Perfil</h1>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl">
         <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Nome</p>
            <p className="text-lg font-semibold">{`${user.name} ${user.last_name}`}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-semibold">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}