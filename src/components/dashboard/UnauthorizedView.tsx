"use client";

import { useRouter } from "next/navigation";

// Tela para mostrar quando o acesso é negado
export function UnauthorizedView() {
  const router = useRouter();

  const handleLogout = async () => {
    // Chama nosso endpoint de logout seguro
    await fetch('/api/auth/logout', { method: 'POST' });
    // Redireciona para o login
    router.push('/login');
    router.refresh(); // Limpa qualquer cache
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center bg-white p-12 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Acesso Negado</h1>
        <p className="text-gray-700 mb-6">Você não tem permissão para acessar esta área.</p>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}