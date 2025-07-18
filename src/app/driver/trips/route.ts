// src/app/driver/trips/route.ts

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  // 1. TENTATIVA INICIAL
  let backendResponse = await fetch('http://localhost:5001/api/maintenance/old-trips', {
    headers: { 'Authorization': `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  // 2. VERIFICAÇÃO DE FALHA E TENTATIVA DE REFRESH
  if (backendResponse.status === 401) {
    console.log("API Route: Access token expirado, tentando refresh...");
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ message: 'Sessão expirada' }, { status: 401 });
    }

    const refreshResponse = await fetch('http://localhost:5001/api/auth/refresh', {
      method: 'POST',
      headers: { 'Cookie': `refreshToken=${refreshToken}` },
    });

    if (!refreshResponse.ok) {
      return NextResponse.json({ message: 'Sessão inválida' }, { status: 401 });
    }
    
    // 3. SUCESSO NO REFRESH E RETENTATIVA
    const newAccessTokenCookie = refreshResponse.headers.get('set-cookie');
    if (newAccessTokenCookie) {
      const match = newAccessTokenCookie.match(/accessToken=([^;]*)/);
      if (match) {
        accessToken = match[1];

        // Tenta a chamada original novamente com o novo token
        backendResponse = await fetch('http://localhost:5001/api/maintenance/old-trips', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
          cache: 'no-store',
        });
        
        // Se a retentativa funcionou, preparamos a resposta final
        if (backendResponse.ok) {
            const data = await backendResponse.json();
            const response = NextResponse.json(data);
            // Anexamos o novo cookie na resposta que vai para o navegador
            response.headers.set('Set-Cookie', newAccessTokenCookie);
            return response;
        }
      }
    }
    // Se chegamos aqui, o refresh pode ter funcionado mas a retentativa não.
    return NextResponse.json({ message: 'Falha ao reautenticar e buscar dados' }, { status: backendResponse.status });
  }

  // Se a primeira tentativa já deu certo
  if (!backendResponse.ok) {
    return NextResponse.json({ message: 'Falha ao buscar dados do backend' }, { status: backendResponse.status });
  }
  
  const data = await backendResponse.json();
  return NextResponse.json(data);
}