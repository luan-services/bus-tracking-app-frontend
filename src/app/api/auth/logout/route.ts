import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';



// esse route.ts serve para se comunicar server-side com o backend e fazer o logout, após isso ele também destroi os cookies armazenados no front
// (coisa que só da p fazer com arquivos server-side)
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  // Etapa 1: Tentar invalidar o token no servidor do backend (a parte que falta)
  if (refreshToken) {
    try {
      // Faz a chamada para a rota de logout do seu backend principal
      await fetch(`${process.env.BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          // O backend precisa saber qual sessão invalidar.
          // Geralmente, o navegador envia o cookie de refreshToken automaticamente.
          // Se não, você pode precisar enviá-lo no corpo ou como um header.
          'Content-Type': 'application/json',
        },
        // Se o backend espera o token no corpo:
        // body: JSON.stringify({ refreshToken }),
      });
      console.log("Token invalidado com sucesso no backend.");
    } catch (error) {
      // Mesmo que a chamada ao backend falhe, ainda devemos tentar deslogar o usuário do cliente.
      console.error("Falha ao invalidar o token no backend, prosseguindo com a limpeza dos cookies do cliente.", error);
    }
  }

  // Etapa 2: Limpar os cookies no navegador (a parte que já existe)
  cookieStore.set('accessToken', '', { expires: new Date(0), path: '/' });
  cookieStore.set('refreshToken', '', { expires: new Date(0), path: '/' });

  return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
}