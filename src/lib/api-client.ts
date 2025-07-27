
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