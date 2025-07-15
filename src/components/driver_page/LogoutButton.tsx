// src/app/driver/_components/LogoutButton.tsx

"use client"; // Precisa de interatividade!

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // Chama nossa API do Next.js para limpar os cookies de forma segura
    await fetch('/api/logout', { method: 'POST' });
    
    // Redireciona o usuário para a página de login
    router.push('/login');
    router.refresh(); 
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none"
    >
      Logout
    </button>
  );
}