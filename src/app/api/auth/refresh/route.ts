import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Este endpoint atua como um proxy seguro para o cliente
export async function POST() {
  const cookieStore = await cookies();
  // Lê o refresh token HttpOnly, algo que o cliente não pode fazer
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'Refresh token não encontrado.' }, { status: 401 });
  }

  try {
    // Repassa a chamada para o backend real
    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await response.json();

    if (!response.ok) {
      // Se o refresh falhou, limpa os cookies para deslogar o usuário
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');
      return NextResponse.json(data, { status: response.status });
    }

    // Se funcionou, atualiza o cookie accessToken
    const { accessToken: newAccessToken } = data;
    cookieStore.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 15,
    });
    return NextResponse.json({ accessToken: newAccessToken });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}