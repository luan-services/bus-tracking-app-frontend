// src/app/api/driver/history/route.ts

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    // Chame a sua API de backend REAL aqui
    const backendResponse = await fetch('http://localhost:3001/api/trips/my-history', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store', // Sempre buscar dados novos
    });

    if (!backendResponse.ok) {
      // Repassa o erro do backend para o frontend
      const errorData = await backendResponse.json();
      return NextResponse.json(errorData, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}