// components/ConfirmationModal.tsx

import React from 'react';

// define o tipo do modal, garante que o componente receba os parametros isOpen, onClose, onConfirm
interface ConfirmationModalProps {
    children?: React.ReactNode, // props que define os children do objeto
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export const ConfirmationModal = ({isOpen, onClose, onConfirm, children = ''}: ConfirmationModalProps) => {
    // se não está open retorna div vazia
    if (!isOpen) {
        return null;
    }

    // função para fechar modal em caso de click no background
    const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        /* background opaco */
        <div onClick={handleBackgroundClick} className="fixed top-0 left-0 w-full h-screen z-[10000] flex items-center justify-center bg-black/50">
            {/* Modal Card */}
            <div className="m-2 p-8 flex flex-col text-center items-center gap-4 bg-white border-1 border-gray-300 rounded-lg shadow-md w-full max-w-96">
                {/* Confirmation Text */}
                <h2 className="text-center text-lg font-semibold text-gray-800">
                    {children != "" ? children : "Tem certeza que deseja fechar?"}
                </h2>

                {/* Button Container */}
                <div className="flex justify-end gap-4">
                {/* Cancelar Button */}
                <button onClick={onClose} className="cursor-pointer active:scale-95 rounded-md bg-gray-300 px-4 py-2 text-sm w-24 text-gray-800 transition hover:bg-gray-400">
                    Cancelar
                </button>

                {/* Sair Button */}
                <button onClick={onConfirm} className="cursor-pointer active:scale-95 rounded-md bg-red-600 px-4 py-2 text-sm w-24 text-white transition hover:bg-red-700">
                    Sim
                </button>
                </div>
            </div>
        </div>
    );
}