// src/components/Notification.tsx
import {XIcon} from 'lucide-react'

interface NotificationToastProps {
	message: string;
	type: 'success' | 'error';
	className?: string;
	onClick: () => void; // Uma função que será chamada quando o usuário clicar para fechar.
};

export default function NotificationToast({ message, type, onClick, className }: NotificationToastProps) {
	// Define a cor de fundo com base no tipo da notificação.
	const ClassName = className || "p-4 pt-2 pr-2 rounded-xs flex items-start justify-between max-w-sm";
	const typeClasses = type === 'error'  ? 'bg-red-500 text-white' : 'bg-green-500 text-white';

	return (
		// As classes de transição preparam o componente para animações suaves.
		<div className={`${ClassName} ${typeClasses}`}>
			<span className="pt-2">{message}</span>
			<button  onClick={onClick} className="ml-1 rounded-full cursor-pointer" aria-label="Fechar notificação">
				<XIcon strokeWidth={2.5} size={20}></XIcon>
			</button>
		</div>
	);
}