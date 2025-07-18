// src/app/driver/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardTabs from '../../components/driver_page/DashboardTabs';
// importando o type criado (UserProfile)
import { UserProfile } from '@/types';

// ---- FUNÇÃO AUXILIAR QUE RODA NO SERVIDOR ---
// essa função e componente não roda client-side (no navegador), portanto ela pode 'abrir' nosso cookie mesmo que ele seja read-only para 
// browser, isso é seguro, pois de novo, ela não roda no navegador. -
async function fetchUserProfile(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!accessToken) {
    return null; // Se não há token, não há o que fazer.
  }

  // 1. TENTATIVA INICIAL com o accessToken atual
  let response = await fetch('http://localhost:5001/api/users/current/me', { // Sua rota de perfil
    headers: { 'Authorization': `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  // 2. VERIFICAÇÃO DE FALHA (401)
  if (response.status === 401 && refreshToken) {
    console.log("SSR: Access token expirado, tentando refresh...");

    // 3. TENTATIVA DE REFRESH
    const refreshResponse = await fetch('http://localhost:5001/api/auth/refresh', { // Sua rota de refresh
      method: 'POST',
      headers: { 'Cookie': `refreshToken=${refreshToken}` },
    });

    if (!refreshResponse.ok) {
      console.error("SSR: Refresh token falhou.");
      return null; // Se o refresh falhou, a sessão acabou.
    }

    // 4. SUCESSO NO REFRESH E RETENTATIVA
    // Extrai o novo accessToken do cookie que o backend nos enviou
    const newAccessTokenCookie = refreshResponse.headers.get('set-cookie');
    if (newAccessTokenCookie) {
      const match = newAccessTokenCookie.match(/accessToken=([^;]*)/);
      if (match) {
        accessToken = match[1]; // Pegamos o novo token
        // Atualiza o cookie no navegador para a próxima requisição
        cookieStore.set('accessToken', accessToken, {
            httpOnly: true, secure: process.env.NODE_ENV === "production", 
            sameSite: "lax", path: "/", maxAge: 15 * 60 * 1000
        });

        console.log("SSR: Token atualizado. Tentando a chamada de perfil novamente.");
        // Tenta a chamada original novamente com o novo token
        response = await fetch('http://localhost:5001/api/users/current/me', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            cache: 'no-store',
        });
      }
    }
  }

  if (!response.ok) {
    return null;
  }

  return response.json();
}



// ---- O COMPONENTE DA PÁGINA (SSR) ----
export default async function DriverPage() {
  // 1. TAREFA DO GERENTE: Buscar os dados básicos
  const user = await fetchUserProfile();

  if (!user || user.role === 'user') {
    // Se o token for inválido ou a role for inadequada, expulsa para o login
    redirect('/login');
  }

  // 3. TAREFA FINAL: Entregar os dados para o decorador interativo
  //return <p>{JSON.stringify(user)}</p>

  return <DashboardTabs user={user} />; // CARREGAR ISSO AQUI DPS
}