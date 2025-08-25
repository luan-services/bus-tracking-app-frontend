// extends React.ButtonHTMLAttributes<HTMLButtonElement>  importa todas as props basicas do elemento button (className, type, disabled, onClick, id, name, etc...) para o buttonProps
// como estou usando a versão nova sem react.fc, preciso definir children na interface
interface IconProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	children?: React.ReactNode,
}

export const SocialIcon = ({ children, className, ...props}: IconProps) => {	

	// define as classes OU classes extras vindas do pai
	const ClassName = `${className} bg-gray-100 text-gray-500 flex w-full p-1 rounded-md active:scale-95 transition cursor-pointer`

	return (
		<a className={ClassName} {...props}>
			{children}
		</a>
	);
}