import React from 'react';

// extends React.ButtonHTMLAttributes<HTMLButtonElement>  importa todas as props basicas do elemento button (className, type, disabled, onClick, id, name, etc...) para o buttonProps
// lembrando que interface só define o que o objeto pode receber
interface LoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children?: React.ReactNode, // props que define os children do objeto
}

// ButtonProps foram as props que definimos, como não colocamos nada dentro da interface, garante apenas as props básicas do elemento button
export const LoginButton = ({children, className, ...props}: LoginButtonProps) => {
	// define as classes + classes extras vindas do pai
	const ClassName = `${className} w-full flex justify-center bg-green-700 text-white py-2 rounded-lg cursor-pointer hover:bg-green-800 disabled:bg-green-500 disabled:cursor-default transition active:scale-95`;

	return (
		// adiciona className e as outras props que não foram nomeadas (type, submit, etc)
		<button className={ClassName} {...props}>
			{children}
		</button>
	);
};