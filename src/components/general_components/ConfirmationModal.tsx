// components/ConfirmationModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// define o tipo do modal, garante que o componente receba os parametros isOpen, onClose, onConfirm
interface ConfirmationModalProps {
    children?: React.ReactNode, // props que define os children do objeto
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export const ConfirmationModal = ({isOpen, onClose, onConfirm, children = ''}: ConfirmationModalProps) => {

    // função para fechar modal em caso de click no background
    const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        };
    };

    return (
        <AnimatePresence>
            {isOpen && <motion.div onClick={handleBackgroundClick} className="fixed top-0 left-0 w-full h-screen z-[10000] flex items-center justify-center bg-black/50"                       
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}>
                <motion.div className="m-2 p-8 flex flex-col text-center justify-center items-center gap-4 bg-white border-1 border-gray-300 rounded-lg shadow-md w-full max-w-96 min-h-40"                             
                            initial={{opacity: 0, y: -30}}
                            animate={{opacity: 1, y: 0, transition: { type: 'spring', damping: 30, stiffness: 200 }}}
                            exit={{opacity: 0, y: -30, transition: { duration: 1 }}}>
                    {/* Confirmation Text */}
                    <h2 className="text-center text-lg font-semibold text-gray-800">
                        {children != "" ? children : "Tem certeza que deseja fechar?"}
                    </h2>

                    {/* Button Container */}
                    <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="cursor-pointer active:scale-95 rounded-md bg-gray-300 px-4 py-2 text-sm w-24 text-gray-800 transition hover:bg-gray-400">
                        Cancelar
                    </button>

                    {/* Exit Button */}
                    <button onClick={onConfirm} className="cursor-pointer active:scale-95 rounded-md bg-red-600 px-4 py-2 text-sm w-24 text-white transition hover:bg-red-700">
                        Sim
                    </button>
                    </div>
                </motion.div>
            </motion.div>}
        </AnimatePresence>
    );
}