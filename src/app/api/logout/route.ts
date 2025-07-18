// src/app/api/logout/route.ts

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();

  // Limpa os cookies setando uma data de expiração no passado
  cookieStore.set('accessToken', '', { expires: new Date(0), path: '/' });
  cookieStore.set('refreshToken', '', { expires: new Date(0), path: '/' });

  return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
}