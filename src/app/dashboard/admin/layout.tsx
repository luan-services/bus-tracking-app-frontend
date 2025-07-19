import { fetchFromServer } from '@/lib/api';
import { UnauthorizedView } from '@/components/dashboard/UnauthorizedView';
import type { User } from '@/types/index.ts';

// Este layout envolve TODAS as páginas dentro de /admin. Atua como o segundo portão.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Busca os dados do usuário novamente. O Next.js otimiza chamadas idênticas.
  const response = await fetchFromServer('/api/users/current/me');
  if (!response.ok) {
    return <UnauthorizedView />;
  }
  const user: User = await response.json();

  // VERIFICAÇÃO DE ROLE #2: Se o usuário não for 'admin', acesso negado.
  if (user.role !== 'admin') {
    return <UnauthorizedView />;
  }

  // Se for admin, simplesmente renderiza a página filha solicitada.
  return <>{children}</>;
}