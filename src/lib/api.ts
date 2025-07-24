import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function fetchFromServer(path: string, options: RequestInit = {}) {
	const cookieStore = await cookies();
	let accessToken = cookieStore.get('accessToken')?.value;
	const refreshToken = cookieStore.get('refreshToken')?.value;

	if (!accessToken && !refreshToken) {
		redirect('/login');
	}

	// CORREÇÃO #1: Garantimos que 'headers' seja sempre um objeto e já incluímos
	// a autorização inicial. Isso resolve o erro "'headers' is possibly 'undefined'".
	const authorizedOptions: RequestInit = {
		...options,
		headers: {
		// Espalha quaisquer headers que já existam nas opções
		...options.headers,
		'Authorization': `Bearer ${accessToken}`,
		},
		cache: 'no-store',
	};

	let response = await fetch(`${process.env.BACKEND_URL}${path}`, authorizedOptions);

	if (response.status === 401 && refreshToken) {
		console.log("Servidor: Token expirado, tentando refresh...");
		const refreshResponse = await fetch(`${process.env.BACKEND_URL}/api/auth/refresh`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ refreshToken }),
		});

		if (refreshResponse.ok) {
		const data = await refreshResponse.json();
		// Acessamos a propriedade 'accessToken' da resposta
		const newAccessToken = data.accessToken;

		// CORREÇÃO #2: Verificamos se o newAccessToken realmente existe e é uma string
		// antes de tentar usá-lo. Isso resolve o erro de 'string | undefined'.
		if (typeof newAccessToken === 'string') {
			accessToken = newAccessToken;

			// Atualiza o cookie no navegador do cliente
			cookieStore.set('accessToken', accessToken, { httpOnly: true, path: '/', maxAge: 60 * 15 });
			
			// CORREÇÃO #3: Atualizamos o header de forma segura.
			// Como 'authorizedOptions.headers' é garantido ser um objeto, podemos fazer isso.
			(authorizedOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
			
			response = await fetch(`${process.env.BACKEND_URL}${path}`, authorizedOptions);
		} else {
			// Se o refresh bem-sucedido não retornar um token, algo está errado. Deslogamos.
			redirect('/login');
		}
		} else {
		redirect('/login');
		}
	}
	return response;
}


// A função fetchFromClient permanece a mesma da nossa última versão corrigida
export async function fetchFromClient(path: string, options: RequestInit = {}) {
	const finalOptions: RequestInit = {
		...options,
		credentials: 'include',
		headers: {
			...options.headers,
			'Content-Type': 'application/json',
		},
	};

	let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`, finalOptions);

	if (response.status === 401) {
		console.log("Cliente: Token expirado ou inválido, tentando renovar...");
		const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST' });

		if (refreshResponse.ok) {
		console.log("Cliente: Token renovado. Repetindo a requisição original.");
		response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`, finalOptions);
		} else {
		console.log("Cliente: Falha na renovação. Redirecionando para o login.");
		window.location.href = '/login';
		}
	}

	return response;
}