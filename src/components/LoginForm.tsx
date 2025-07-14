// use client define que esse componente seja dinamico com csr.
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// importamos nosso componente de notificação de erro.
import NotificationToast from './NotificationToast';

// definimos o tipo para o estado da nossa notificação.
type NotificationState = {
	message: string;
	type: 'success' | 'error';
} | null;

export default function LoginForm() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(false);
	const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
	const [isLoading, setIsLoading] = useState(false);
	
	// NOVO: Estado para controlar nossa notificação.
	const [notification, setNotification] = useState<NotificationState>(null);
	
	const router = useRouter();

	// NOVO: useEffect para fazer a notificação desaparecer sozinha.
	useEffect(() => {
		// Se não houver notificação, não faz nada.
		if (!notification) return;

		// Cria um timer para limpar a notificação após 3 segundos (3000 ms).
		const timer = setTimeout(() => {
		setNotification(null);
		}, 5000);

		// Função de limpeza: se o componente for desmontado, o timer é cancelado.
		// Isso evita erros de "memory leak".
		return () => clearTimeout(timer);
	}, [notification]); // Este efeito roda toda vez que a 'notification' muda.

	const validateForm = () => { /* ... (nenhuma mudança aqui) ... */
		const newErrors: { email?: string; password?: string } = {};
		if (!email || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Por favor, insira um email válido.';
		if (!password || password.length < 8) newErrors.password = 'A senha deve ter no mínimo 8 caracteres.';
		return newErrors;
	};

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setIsLoading(true);
		setErrors({});
		setNotification(null); // Limpa notificações antigas no início

		const validationErrors = validateForm();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch('http://localhost:5001/api/users/login', { /* ... */
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, rememberMe }),
				credentials: 'include',
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.message || 'Credenciais inválidas.');

			// ALTERADO: Em vez de toast, definimos nosso estado de notificação para sucesso.
			setNotification({ message: 'Login realizado com sucesso!', type: 'success' });
			
			// Espera um pouco para o usuário ver a mensagem de sucesso antes de redirecionar
			setTimeout(() => {
				router.push('/driver/dashboard');
			}, 1000); // 1 segundo

		} catch (err: any) {
		// ALTERADO: Em vez de toast, definimos nosso estado de notificação para erro.
			let error_message:string = ''
				
			// tratando as possíveis mensagens de erro enviadas pelo bd (foram definidas lá), não é necessário tratar mais nada além disso, 
			// pois só faltam as regras do joi, e o form trata elas e também só envia o submit se respeitá-las, o único jeito de chegar aqui 
			// com credenciais invalidas para o joi é editando o html do form ou enviando request por fora (já não é problema do front, ele não tem que tratar)
			if (err.message == 'email or password invalid') {
				error_message = 'Erro: Email ou senha inválidos.'
			}
			else if (err.message == 'Failed to fetch')  {
				error_message = 'Erro: Falha ao enviar, o servidor pode estar offline.'
			}
			else {
				error_message = err.message
			}
			
			setNotification({ message: error_message, type: 'error' });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<> 

		<form onSubmit={handleSubmit} noValidate className="p-8 flex flex-col items-center gap-4 bg-white rounded-lg shadow-lg w-full max-w-96">

				{/* Usamos um Fragment (<>) para agrupar o formulário e a notificação */}
			{/* NOVO: Renderiza a notificação condicionalmente. */}
			{notification && 
				<NotificationToast message={notification.message} type={notification.type} onClick={() => setNotification(null)}/> // passando as props pro component notification
			}




			{/* ... O resto do formulário permanece exatamente igual ... */}
			<h2 className="text-2xl font-bold">Acesso Restrito</h2>
		
			<div className="flex flex-col w-full">
				<label className="flex text-gray-700 py-1" htmlFor="email">Email</label>

				<input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} 
					className={`w-full flex p-2 border-1 border-gray-500 rounded-xs focus:outline-none ${errors.email ? 'border-red-500' : 'focus:border-blue-500'}`}/>

				{errors.email ? <p className="text-red-500 text-xs h-1 py-1 px-1 w-full">{errors.email}</p> : <p className="py-1 px-1 h-1"></p>}
			</div>

			<div className="flex flex-col w-full">
				<label className="block text-gray-700 py-1" htmlFor="password">Senha</label>
				<input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
					className={`w-full flex p-2 border-1 border-gray-500 rounded-xs focus:outline-none ${errors.password ? 'border-red-500' : 'focus:border-blue-500'}`}/>

				{errors.password ? <p className="text-red-500 text-xs h-1 py-1 px-1 w-full">{errors.password}</p> : <p className="py-1 px-1 h-1"></p>}
			</div>
			
			<div className="flex w-full py-4 px-1 gap-2">
				<input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="flex"/>
				<label className="flex text-gray-700" htmlFor="rememberMe">Lembrar de mim</label>
			</div>
			
			<button type="submit" disabled={isLoading}
				className="w-full flex justify-center bg-green-700 text-white py-2 rounded-lg cursor-pointer hover:bg-green-800 disabled:bg-green-500 disabled:cursor-default transition active:scale-95">
				{isLoading ? 'Entrando...' : 'Entrar'}
			</button>


	

		</form>


		</>
	);
}