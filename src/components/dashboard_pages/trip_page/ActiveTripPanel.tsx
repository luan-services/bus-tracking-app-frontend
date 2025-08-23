'use client';

import { useState } from 'react';
import { fetchFromClient } from '@/lib/api-client';
import { GenericButton } from '@/components/general_components/GenericButton';
import { ConfirmationModal } from '@/components/general_components/ConfirmationModal';

interface ActiveTripPanelProps {
    tripId: string;
    isUpdatingPosition: boolean;
    onToggleUpdate: () => void;
    onTripEnd: () => void;
    disabled: boolean;
};

export const ActiveTripPanel= ({ tripId, isUpdatingPosition, onToggleUpdate, onTripEnd, disabled }: ActiveTripPanelProps) => {
    const [isLoading, setIsLoading] = useState(false); // isLoading serve para desabilitar o botão de encerrar viagem enquanto o encerramento esriver carregando
    const [error, setError] = useState<string | null>(null); // server para setar um elemento com mensagem de erro caso algo aconteça

	const [isModalOpen, setIsModalOpen] = useState(false); // state para o modal de encerrar viagem

    const handleEndTrip = async () => {

        setIsLoading(true); // muda para carregando enquanto está enviando o request pro bd
        setError(null); // limpa erros

        try {
            const response = await fetchFromClient(`/api/trips/${tripId}/end`, {
                method: 'PATCH',
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Erro ao encerrar viagem.'); // se a resposta falar lança um erro com 'data.message' (se existe)
            
            onTripEnd(); // chama on trip end do page.tsx (só se não houve erro)

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Um erro desconhecido ocorreu.')
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={`flex flex-col w-full gap-2 lg:max-w-[calc(50%-8px)] bg-white p-4 rounded-lg border-1 border-gray-300 shadow-xs ${!disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <h2 className="text-lg md:text-xl font-bold">Viagem em Andamento</h2>
                <p className="text-sm text-gray-600 mb-2">ID da Viagem: <span className="font-mono bg-gray-100 p-1 rounded">{tripId}</span></p>
                <div className="flex w-full justify-center flex-wrap sm:flex-nowrap gap-2">
                    <GenericButton onClick={onToggleUpdate} disabled={!disabled} className="w-full disabled:cursor-not-allowed" colors={`${isUpdatingPosition ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600 disabled:hover:bg-blue-500'}`}>
                        {isUpdatingPosition ? 'Pausar Envio' : 'Continuar Viagem'}
                    </GenericButton>

                    <GenericButton onClick={() => setIsModalOpen(true)} disabled={!disabled} className="w-full disabled:cursor-not-allowed" colors="bg-red-600 hover:bg-red-700 disabled:bg-gray-400">
                        {isLoading ? 'Encerrando...' : 'Encerrar Viagem'}
                    </GenericButton>
            
                    
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            
            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={() => {handleEndTrip(), setIsModalOpen(false)}}>
                Tem certeza que deseja encerrar a viagem?
            </ConfirmationModal>
        </>
    );
};