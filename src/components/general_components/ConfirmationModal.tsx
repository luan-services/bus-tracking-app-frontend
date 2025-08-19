// components/ConfirmationModal.tsx

import React from 'react';

// define o tipo do modal, garante que o componente receba os parametros isOpen, onClose, onConfirm
interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export const ConfirmationModal = ({isOpen, onClose, onConfirm,}: ConfirmationModalProps) => {
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
        <div onClick={handleBackgroundClick} className="fixed top-0 left-0 w-full h-screen z-50 flex items-center justify-center bg-black/50">
            {/* Modal Card */}
            <div className="m-2 p-8 flex flex-col text-center items-center gap-4 bg-white border-1 border-gray-200 rounded-lg shadow-md w-full max-w-96">
                {/* Confirmation Text */}
                <h2 className="text-center text-lg font-semibold text-gray-800">
                    Tem certeza que deseja sair?
                </h2>

                {/* Button Container */}
                <div className="flex justify-end gap-4">
                {/* Cancelar Button */}
                <button onClick={onClose} className="cursor-pointer active:scale-95 rounded-md bg-gray-200 px-4 py-2 text-sm w-24 text-gray-800 transition hover:bg-gray-300">
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