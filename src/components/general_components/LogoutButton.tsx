"use client"; // ESSENCIAL: Este componente é interativo (tem um onClick)

import { useRouter} from "next/navigation";
import { useState } from "react";
import { LogOut } from 'lucide-react'; // Ícone opcional para estilo
import { ConfirmationModal } from "./ConfirmationModal";

// extends React.ButtonHTMLAttributes<HTMLButtonElement>  importa todas as props basicas do elemento button (className, type, disabled, onClick, id, name, etc...) para o buttonProps
// como estou usando a versão nova sem react.fc, preciso definir children na interface
interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children?: React.ReactNode,
	useConfirmScreen?: boolean,
	onClickParent?: (prop?: boolean) => void; // função unica pro botão de logout do dashboard, em outros lugares não faz nada
	activeText?: string,
	buttonColor?: string,
};

// export function LogoutButton({ children, className, useConfirmScreen = true }: LogoutButtonProps) << forma mais 'moderna' de fazer (ambas iguais)
export const LogoutButton = ({ children, className, useConfirmScreen = true, activeText = "Saindo...", buttonColor = "white", onClickParent = (prop: boolean = true) => ''}: LogoutButtonProps) => {	
	// estado para definir se o fetch está carregando ou está completo.
	const [isLoading, setIsLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// router para redicionamento
	const router = useRouter();

	const handleLogout = async () => {
	
		setIsLoading(true); // useState que quando é true muda o texto do botão para 'carregando' e desativa ele

		try {
			// logout faz uma chamada direto pro route.ts do frontend (via client), o route por sua vez chama o logout do backend e destroi
			// os cookies (via server)							
			// desligar o backend não causa erro aqui, pois o route de logout remove os cookies no frontend
			const response = await fetch('/api/auth/logout', { method: 'POST' });

			// Verificamos se o servidor respondeu com sucesso
			if (!response.ok) {
				// Se não, lançamos um erro para ser pego pelo bloco 'catch'
				throw new Error('O servidor de logout respondeu com um erro.');
			}
			// Redireciona para a página de login após o logout ser bem-sucedido
			router.push('/login');
			// Força um refresh da página para limpar qualquer estado em cache no cliente
			router.refresh(); 

		} catch (error) {
			console.error("Falha ao tentar fazer logout:", error);
			// pode adicionar uma notificação de erro para o usuário aqui, por enquanto não é necessário
			alert("Ocorreu um erro ao sair. Por favor, tente novamente.");
		} 

		// desativa o modal
		setIsModalOpen(false)
		// onClick é uma prop criada apenas para dashboard, por causa do bug do elemento filho dar trigger no group-hover
		onClickParent();
	};
	
	const handleClick = () => {
        if (useConfirmScreen) {
            setIsModalOpen(true);
			onClickParent();
        } else {
            handleLogout();
        }
    };

	// define as classes OU classes extras vindas do pai
	const ClassName = className || `min-w-32 flex items-center gap-4 justify-center bg-red-500 text-white py-2 rounded-lg cursor-pointer hover:bg-red-800 disabled:bg-red-300 disabled:cursor-default transition active:scale-95`;


	return (
		<>
			<button onClick={() => handleClick()} className={ClassName} disabled={isLoading}>
				<LogOut size={20} color={buttonColor}/>
				{isLoading ?  (activeText ? activeText : children) : children}
			</button>

			<ConfirmationModal isOpen={isModalOpen} onConfirm={() => handleLogout()} onClose={() => {setIsModalOpen(false), onClickParent()}}></ConfirmationModal>
		</>
	);
}