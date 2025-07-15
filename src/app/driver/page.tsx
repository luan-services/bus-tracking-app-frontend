// src/app/driver/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardTabs from '../../components/driver_page/DashboardTabs';
// importando o type criado (UserProfile)
import { UserProfile } from '@/types';

// ---- FUNÇÃO AUXILIAR QUE RODA NO SERVIDOR ---
// essa função e componente não roda client-side (no navegador), portanto ela pode 'abrir' nosso cookie mesmo que ele seja read-only para browser, isso é seguro, pois de novo, ela não roda no navegador.
async function getUserProfile(token: string): Promise<UserProfile | null> {
	try {
		const res = await fetch('http://localhost:3001/api/auth/me', { // SUA URL DE BACKEND AQUI
			headers: { 'Authorization': `Bearer ${token}` },
			cache: 'no-store',
		});
		if (!res.ok) return null;
		return res.json();
	} catch (error) {
		console.error("Fetch user profile error:", error);
		return null;
	}
}

// ---- O COMPONENTE DA PÁGINA (SSR) ----
export default async function DriverPage() {
  // 1. TAREFA DO PORTEIRO: Verificar a chave (cookie)
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/login');
  }

  // 2. TAREFA DO GERENTE: Buscar os dados básicos
  const user = await getUserProfile(accessToken);

  if (!user || user.role === 'user') {
    // Se o token for inválido ou a role for inadequada, expulsa para o login
    redirect('/login');
  }

  // 3. TAREFA FINAL: Entregar os dados para o decorador interativo
  return <DashboardTabs user={user} />;
}