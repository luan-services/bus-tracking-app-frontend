"use client"; // Componente interativo, precisa rodar no cliente.

import { usePathname, useRouter } from 'next/navigation';
import { User as UserIcon, MapPlus, Settings, Pin, PinOff } from 'lucide-react';
import type { User } from '@/types/index.ts';
import { NavItem } from './NavItem';
import { LogoutButton } from '../general_components/LogoutButton';
import { useState } from 'react';

// Recebe o usuário como prop para saber quais botões renderizar
export function DashboardNav({ user }: { user: User }) {
	const [isExpanded, setIsExpanded] = useState(false);


	const pathname = usePathname();
	const router = useRouter();

	// Uma lista de todos os possíveis itens de navegação, cada um com as roles permitidas
	const navItems = [
		{ href: '/dashboard/profile', label: 'Perfil', icon: UserIcon, roles: ['driver', 'admin'] },
		{ href: '/dashboard/trip', label: 'Viagem', icon: MapPlus, roles: ['driver', 'admin'] },
		{ href: '/dashboard/admin/users', label: 'Admin', icon: Settings, roles: ['admin'] },
	];

	return (
		<section className={`${isExpanded ? 'md:w-64' : 'hover:md:w-64'} group bottom-0 fixed md:static w-full md:w-15 px-2 md:px-3 md:py-6 justify-center md:justify-start flex flex-row md:flex-col gap-4 bg-gray-800 text-white duration-300 ease-in-out`}>
			
			{/* desktop pin */}
			<div className="hidden md:flex w-full">
				<button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-md hover:bg-gray-700 active:scale-95 transition cursor-pointer">
          			{isExpanded ? <PinOff strokeWidth={2.5} size={20} /> : <Pin strokeWidth={2.5} size={20} />}
        		</button>
			</div>

			{/* desktop panel */}
			<div className="hidden md:flex items-center justify-center text-xl font-bold overflow-hidden h-7">
				<span className={`${isExpanded ? 'opacity-100 delay-200' : 'opacity-0 group-hover:opacity-100 group-hover:delay-200'} duration-100`}>
					Painel do Motorista
				</span>
			</div>

			{/* desktop nav */}
			<nav className="hidden md:flex flex-col gap-24 md:py-12">
				<ul className="flex flex-col gap-2">
					{navItems.filter(item => item.roles.includes(user.role)).map(item => (
							<li key={item.href}>
								<NavItem className={pathname.startsWith(item.href) ? 'bg-gray-700' : 'hover:bg-gray-900'} onClick={() => router.push(item.href)}>
									<item.icon strokeWidth={2.5} size={20} />
									<span className={` ${isExpanded ? 'opacity-100 max-w-full ml-3 delay-200' : "group-hover:max-w-full group-hover:ml-3 group-hover:opacity-100 group-hover:delay-200"} text-sm max-w-0 opacity-0 duration-300`}>{item.label}</span>
								</NavItem>
							</li>
						)
					)}
				</ul>
				
				<div className="flex">
					{/* setIsExpanded é uma prop criada só pra esse elemento, por causa do bug do elemento filho dar trigger no group-hover */}
					<LogoutButton setIsExpanded={() => setIsExpanded(!isExpanded)} useConfirmScreen={true} activeText="" buttonColor="red" className={" hover:bg-gray-900 flex w-full p-2 rounded-md active:scale-95 transition cursor-pointer"}>
						<span className={` ${isExpanded ? 'opacity-100 max-w-full ml-3 delay-200' : "group-hover:max-w-full group-hover:ml-3 group-hover:opacity-100 group-hover:delay-200"} text-sm max-w-0 opacity-0 duration-300`}>Sair</span>
					</LogoutButton>	
				</div>
			</nav>

			{/* mobile nav */}
			<nav className="flex md:hidden gap-2">
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
				<div className="flex md:h-full md:justify-center md:items-center">
					<LogoutButton useConfirmScreen={true} activeText="" buttonColor="red" className={"p-2 active:scale-95 transition cursor-pointer"}></LogoutButton>	
				</div>
			</nav>

		</section>
	);
}