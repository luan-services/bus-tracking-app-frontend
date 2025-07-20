"use client"; // Componente interativo, precisa rodar no cliente.

import { usePathname, useRouter } from 'next/navigation';
import { User as UserIcon, Map, Settings } from 'lucide-react';
import type { User } from '@/types/index.ts';

// Recebe o usuário como prop para saber quais botões renderizar
export function DashboardNav({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  // Uma lista de todos os possíveis itens de navegação, cada um com as roles permitidas
  const navItems = [
    { href: '/dashboard/profile', label: 'Perfil', icon: UserIcon, roles: ['driver', 'admin'] },
    { href: '/dashboard/trip', label: 'Viagem', icon: Map, roles: ['driver', 'admin'] },
    { href: '/dashboard/admin/users', label: 'Admin', icon: Settings, roles: ['admin'] },
  ];

  return (
    <section className="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-gray-700">
        Painel do Motorista
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {navItems.map((item) =>
            // Lógica de renderização condicional: só mostra o botão se a role do usuário estiver na lista
            item.roles.includes(user.role) && (
              <li key={item.href}>
                <button
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    pathname.startsWith(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            )
          )}
        </ul>
      </nav>
    </section>
  );
}