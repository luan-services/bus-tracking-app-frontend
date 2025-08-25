// extends React.ButtonHTMLAttributes<HTMLButtonElement>  importa todas as props basicas do elemento button (className, type, disabled, onClick, id, name, etc...) para o buttonProps
// como estou usando a versão nova sem react.fc, preciso definir children na interface
interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children?: React.ReactNode,
}

export const NavItem = ({ children, className, ...props}: LogoutButtonProps) => {	

	// define as classes OU classes extras vindas do pai
	const ClassName = `${className} flex w-full p-2 rounded-md active:scale-95 transition cursor-pointer`

	return (
		<button className={ClassName} {...props}>
			{children}
		</button>
	);
}