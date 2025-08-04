import React from 'react';

// extends React.ButtonHTMLAttributes<HTMLButtonElement>  importa todas as props basicas do elemento button (className, type, disabled, onClick, id, name, etc...) para o buttonProps
// lembrando que interface só define o que o objeto pode receber
interface GenericButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode, // props que define os children do objeto
    colors?: string
}

// ButtonProps foram as props que definimos, como não colocamos nada dentro da interface, garante apenas as props básicas do elemento button
// ...props são as props onCLick, type, etc passadas
export const GenericButton = ({children, className, colors = '', ...props}: GenericButtonProps) => {
    // define as classes + classes extras vindas do pai
    const colorsClasses = colors || "bg-green-700 hover:bg-green-800"
    const ClassName = `${className} ${colorsClasses} self-center flex justify-center items-center text-sm text-white p-2 rounded-lg cursor-pointer transition active:scale-95 disabled:scale-100`;

    return (
        // adiciona className e as outras props que não foram nomeadas (type, submit, etc)
        <button className={ClassName} {...props}>
            {children}
        </button>
    );
};