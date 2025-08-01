// interfaces são parâmetros que explica o que cada atributo de um objeto vai ser. (no typescript)
// types são parâmetros que definem um TIPO para ser atribuído à uma função, variável, etc. Ex: string, int, são types, 
// só que existem custom types que podem ser objetos. A maior diferença é que um type pode ser um conjunto de coisas, interface é só um, um objeto (no typescript)

// Interfaces para models 

// se essa interface for definido à um atributo, o atributo em questão só podera ser o objeto descrito.
// At dashboard/layout.tsx , dashboard/profile/page.tsx, dashboard/driver_page/ProfileTab.tsx, components/dashboard/DashBoardNav.tsx
export interface User {
	id?: string;
	name?: string;
	last_name?: string;
	role: 'user' | 'driver' | 'admin';
	code?: string;
	email?: string;
	cpf?: string;
}


// Interfaces e Types para componentes

// se esse type for definido à um atributo, o atributo em questão só podera ser um objeto OU null
// At components/login_page/LoginForm.tsx,
export type NotificationToastPropsState = {
	message: string;
	type: 'success' | 'error';
} | null;

// At components/login_page/NotificationToast.tsx
export type NotificationToastProps = {
	message: string;
	type: 'success' | 'error';
	className?: string;
	onClick: () => void; // Uma função que será chamada quando o usuário clicar para fechar.
};

