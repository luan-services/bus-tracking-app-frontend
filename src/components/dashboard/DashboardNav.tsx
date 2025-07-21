"use client"; // Componente interativo, precisa rodar no cliente.

import { usePathname, useRouter } from 'next/navigation';
import { User as UserIcon, MapPlus, Settings } from 'lucide-react';
import type { User } from '@/types/index.ts';
import { NavItem } from './NavItem';
import { LogoutButton } from '../general_components/LogoutButton';

// Recebe o usuário como prop para saber quais botões renderizar
export function DashboardNav({ user }: { user: User }) {
	const pathname = usePathname();
	const router = useRouter();

	// Uma lista de todos os possíveis itens de navegação, cada um com as roles permitidas
	const navItems = [
		{ href: '/dashboard/profile', label: 'Perfil', icon: UserIcon, roles: ['driver', 'admin'] },
		{ href: '/dashboard/trip', label: 'Viagem', icon: MapPlus, roles: ['driver', 'admin'] },
		{ href: '/dashboard/admin/users', label: 'Admin', icon: Settings, roles: ['admin'] },
	];

	return (
		<section className="order-1 md:order-0 p-2 md:p-6 justify-center md:justify-start flex flex-row md:flex-col gap-4 md:border-r-2 md:border-gray-900 bg-gray-800 text-white">
			<div className="hidden md:flex items-center justify-center text-xl font-bold">
				<span>Painel do Motorista</span>
			</div>
			<nav className="flex">
				<ul className="flex flex-row md:flex-col w-full gap-2">
					{navItems.filter(item => item.roles.includes(user.role)).map(item => (
							<li key={item.href}>
								<NavItem className={pathname.startsWith(item.href) ? 'bg-gray-700' : 'hover:bg-gray-900'} onClick={() => router.push(item.href)}>
									<item.icon strokeWidth={2.5} size={20} />
									<span className="hidden md:inline text-sm">{item.label}</span>
								</NavItem>
							</li>
						)
					)}
				</ul>
			</nav>
			<div className="flex md:flex-1 md:items-end">
				<LogoutButton useConfirmScreen={true} activeText="" className={" bg-red-800 items-center justify-center gap-3 p-2 rounded-md active:scale-95 transition cursor-pointer"}></LogoutButton>	
			</div>

		</section>
	);
}