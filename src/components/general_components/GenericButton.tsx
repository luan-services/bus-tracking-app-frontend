import React from 'react';

// extends React.ButtonHTMLAttributes<HTMLButtonElement>  importa todas as props basicas do elemento button (className, type, disabled, onClick, id, name, etc...) para o buttonProps
// lembrando que interface só define o que o objeto pode receber
interface GenericButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode, // props que define os children do objeto
    addClass?: string
}

// ButtonProps foram as props que definimos, como não colocamos nada dentro da interface, garante apenas as props básicas do elemento button
// ...props são as props onCLick, type, etc passadas
export const GenericButton = ({children, className, ...props}: GenericButtonProps) => {
    // define as classes + classes extras vindas do pai
    const ClassName = `${className} flex justify-center bg-green-700 text-white p-2 rounded-lg cursor-pointer hover:bg-green-800 disabled:bg-green-500 transition active:scale-95`;

    return (
        // adiciona className e as outras props que não foram nomeadas (type, submit, etc)
        <button className={ClassName} {...props}>
            {children}
        </button>
    );
};