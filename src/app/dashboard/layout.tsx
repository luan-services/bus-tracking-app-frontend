import { redirect } from 'next/navigation';
import { fetchFromServer } from '@/lib/api';
import type { User } from '@/types/index.ts';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { UnauthorizedView } from '@/components/dashboard/UnauthorizedView';

// Este é o layout principal do dashboard. Atua como o primeiro portão de segurança.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Usa nossa função de servidor para buscar os dados do usuário
  const response = await fetchFromServer('/api/users/current/me');

  // Se a resposta não for OK (mesmo após a tentativa de refresh), o usuário não é válido.
  if (!response.ok) {
    redirect('/login');
  }
  const user: User = await response.json();

  // VERIFICAÇÃO DE ROLE #1: Se for um usuário comum, mostra a tela de acesso negado.
  if (user.role === 'user') {
    return <UnauthorizedView />;
  }

  // Se passou nas verificações, renderiza a estrutura da dashboard.
  return (
    <div className="flex flex-row h-screen bg-gray-100 font-sans">
      {/* Passa os dados do usuário para a barra de navegação para ela saber quais botões mostrar */}
      <DashboardNav user={user} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}