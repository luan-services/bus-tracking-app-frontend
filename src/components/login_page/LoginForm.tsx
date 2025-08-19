// use client define que esse componente seja dinamico com csr.
"use client";
// importando useState, useEffect e os types (<T> do typescript) 'FormEvent', 'ChangeEvent'
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
// importando use router, para enviar o usuário para o url da dashboard do motorista após login
import { useRouter } from 'next/navigation';
// importamos nosso componente de notificação de erro.
import NotificationToast from '../general_components/NotificationToast';

// como o componente NotificationToast recebe 2 parametros (mensagem e tipo) precisamos definir um type para ele
type NotificationToastPropsState = {
	message: string;
	type: 'success' | 'error';
} | null;

import { LoginButton } from './LoginButton';

// função básica para validar os campos de email e password, recebe fieldName e value, retorna uma string (texto dizendo o erro) ou undefined (caso não haja erro)
function validateField(fieldName: 'email' | 'password', value: string): string | undefined {
	switch (fieldName) {
		case 'email':
			if (!value || !/\S+@\S+\.\S+/.test(value)) {
				return 'Por favor, insira um email válido.';
			}
			return undefined;
		case 'password':
			if (!value || value.length < 8 || value.length > 60) {
				return 'A senha deve ter entre 8 e 60 caracteres.';
			}
			return undefined;
		default:
			return undefined;
	}
}

// componente loginForm
export default function LoginForm() {
	// estados para os inputs do email, password e rememberMe
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(false);
	// estado tipo obj com campos email e password para guardar 'string' dos erros caso acontecam
	const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
	// estado para definir se o fetch está carregando ou está completo.
	const [isLoading, setIsLoading] = useState(false);
	
	// NOVO: Estado para controlar nossa notificação.
	const [notification, setNotification] = useState<NotificationToastPropsState>(null);

	// estado para definir se está checando o login do usuário, enquanto for true, não mostra nada na página de login.
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	
	// cria um router para redirecionar o usuário após um login bem sucedido.
	const router = useRouter();

	// função para redirecionar o usuário para a dashboard caso ele tente acessar login já estando logado
	useEffect(() => {
		const checkSession = async () => {
		try {
			// Tentamos chamar o endpoint de refresh. O navegador enviará os cookies
			// automaticamente se 'credentials: include' for usado.
			const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh`, {
			method: 'POST',
			credentials: 'include', 
			});

			if (response.ok) {
			// Se a resposta for OK, o usuário tem uma sessão válida.
			// Redirecionamos para o dashboard.
				router.push('/dashboard/profile');
			} else {
				// Se falhar, o usuário não está logado. Liberamos a exibição do formulário.
				setIsCheckingAuth(false);
			}
		} catch (error) {
			// Em caso de erro de rede, também liberamos o formulário.
			console.error("Falha ao verificar sessão:", error);
			setIsCheckingAuth(false);
		}
		};

		checkSession();
	}, [router]); // O array de dependências com 'router' garante que isso rode apenas uma vez.

	// função que é chamada para validar o campo e-mail, é chamada a cada vez que o usuário digita algo.
	const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newEmail = e.target.value;
		setEmail(newEmail); // 1. Atualiza o estado do email

		// 2. Valida o novo valor em tempo real
		const emailError = validateField('email', newEmail);

		// 3. Atualiza o estado de erros
		// Usamos a forma de callback (prevErrors => ...) para garantir que não
		// vamos apagar o erro do campo de senha que possa já existir.
		setErrors(prevErrors => ({
		...prevErrors,
		email: emailError,
		}));
	};

	// função que é chamada para validar o campo e-mail, é chamada a cada vez que o usuário digita algo.
	const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newPassword = e.target.value;
		setPassword(newPassword); // 1. Atualiza o estado da senha

		// 2. Valida o novo valor em tempo real
		const passwordError = validateField('password', newPassword);
		
		// 3. Atualiza o estado de erros
		setErrors(prevErrors => ({
		...prevErrors,
		password: passwordError,
		}));
  	};

	// useEffect para fazer a notificação desaparecer sozinha.
	useEffect(() => {
		// Se não houver notificação, não faz nada.
		if (!notification) return;

		// Cria um timer para limpar a notificação após 5 segundos (5000 ms).
		const timer = setTimeout(() => {
			setNotification(null);
		}, 5000);

		// Função de limpeza: se o componente for desmontado, o timer é cancelado.
		// Isso evita erros de "memory leak".
		return () => clearTimeout(timer);
	}, [notification]); // Este efeito roda toda vez que a 'notification' muda.

	// função principal, responsável por enviar o request do form ao clicar em login.
	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault(); // previne o reload da página

		setIsLoading(true); // useState que quando é true muda o texto do botão para 'carregando' e desativa ele
		setErrors({}); // limpa o campo de erros.
		//setNotification(null); // limpa notificações antigas no início // não precisa limpar pois está causando um efeito de blink com requests muito rapoidos, e ela sai sozinha

		const emailError = validateField('email', email); // valida uma última vez os campos
    	const passwordError = validateField('password', password); // valida uma última vez os campos
		
		// caso haja algum erro, mostra nos campos e termina a função
		if (emailError || passwordError) {
			setErrors({ email: emailError, password: passwordError });
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, { /* ... */
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, rememberMe }),
				credentials: 'include',
			});
			// salva a resposta
			const data = await response.json();
			// se não for uma response 'ok', lança um erro e termina a função
			if (!response.ok) throw new Error(data.message || 'Credenciais inválidas.');

			// definimos nosso estado de notificação para sucesso, isso vai renderizar o Toast na tela
			setNotification({ message: 'Login realizado com sucesso!', type: 'success' });
			
			// Espera um pouco para o usuário ver a mensagem de sucesso antes de redirecionar
			setTimeout(() => {
				router.push('/dashboard/profile');
			}, 500); // 1 segundo

		} catch (err) { 
			
			let error_message:string = 'Um erro desconhecido ocorreu.'
			
			// se for um erro do tipo Error, ele foi jogado pelo backend após tratar a resposta, procura tratar a mensagem de error aqui dentro
			if (err instanceof Error) {
				// tratando as possíveis mensagens de erro enviadas pelo bd (foram definidas lá), não é necessário tratar mais nada além disso, 
				if (err.message == 'Email or password not valid') {
					error_message = 'Erro: Email ou senha inválidos.'
				}
				else if (err.message == 'Failed to fetch')  {
					error_message = 'Erro: Falha ao enviar, o servidor pode estar offline.'
				}
				else { // aqui o backend jogou um erro diferente que pode ou não possuir message, se não possuir vai ser ('Credenciais inválidas')
					error_message = err.message
				}
			}
			
			// se não for um erro do tipo Error, só coloca a mensagem padrão
			setNotification({message: error_message, type: 'error' }); // muda o estado que tem as propriedades do toast, renderizando ele na tela pq deixa de ser null
			setIsLoading(false)
		} 
	};

	  // se ainda estiver verifcando se o usuário está logado, mostra esse html
	if (isCheckingAuth) {
		return (
			<div className="flex w-full items-center justify-center min-h-screen bg-gray-100">
				<p className="text-lg animate-pulse">Verificando sessão...</p>
			</div>
		);
	}

	// se o usuário não estiver logado, mostra esse
	return (
		<> 

		<form onSubmit={handleSubmit} noValidate className="p-8 flex flex-col items-center gap-4 bg-white sm:border-1 border-gray-300 sm:rounded-lg sm:shadow-md w-full max-w-96">

				{/* Usamos um Fragment (<>) para agrupar o formulário e a notificação */}
			{/* NOVO: Renderiza a notificação condicionalmente. */}
			{notification && 
				<NotificationToast message={notification.message} type={notification.type} onClick={() => setNotification(null)}/> // passando as props pro component notification
			}

			{/* ... O resto do formulário permanece exatamente igual ... */}
			<h2 className="text-2xl font-bold">Acesso Restrito</h2>
		
			<div className="flex flex-col w-full">
				<label className="flex text-gray-700 py-1" htmlFor="email">Email</label>

				<input type="email" id="email" value={email} onChange={(e) => handleEmailChange(e)} 
					className={`w-full flex p-2 border-1 border-gray-500 rounded-xs focus:outline-none ${errors.email ? 'border-red-500' : 'focus:border-blue-500'}`}/>

				<p className="text-red-500 text-xs h-1 py-1 px-1 w-full">{errors.email ? errors.email : ''}</p>
			</div>

			<div className="flex flex-col w-full">
				<label className="block text-gray-700 py-1" htmlFor="password">Senha</label>
				<input type="password" id="password" value={password} onChange={(e) => handlePasswordChange(e)}
					className={`w-full flex p-2 border-1 border-gray-500 rounded-xs focus:outline-none ${errors.password ? 'border-red-500' : 'focus:border-blue-500'}`}/>

				<p className="text-red-500 text-xs h-1 py-1 px-1 w-full">{errors.password ? errors.password : ''}</p>
			</div>
			
			<div className="flex w-full py-4 px-1 gap-2">
				<input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="flex w-3.75 accent-green-700 cursor-pointer"/>
				<label className="flex text-gray-700 cursor-pointer" htmlFor="rememberMe">Mantenha-me conectado</label>
			</div>
			
			<LoginButton type="submit" disabled={isLoading}>
				{isLoading ? 'Entrando...' : 'Entrar'}
			</LoginButton>
		</form>


		</>
	);
}