'use client';

import { useState } from 'react';
import { fetchFromClient } from '@/lib/api-client';
import { GenericButton } from '@/components/general_components/GenericButton';

interface ActiveTripPanelProps {
    tripId: string;
    isUpdatingPosition: boolean;
    onToggleUpdate: () => void;
    onTripEnd: () => void;
    disabled: boolean;
}

const ActiveTripPanel: React.FC<ActiveTripPanelProps> = ({ tripId, isUpdatingPosition, onToggleUpdate, onTripEnd, disabled }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEndTrip = async () => {
        if (!window.confirm('Tem certeza que deseja encerrar a viagem?')) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchFromClient(`/api/trips/${tripId}/end`, {
                method: 'PATCH',
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Erro ao encerrar viagem.');
            
            onTripEnd();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`flex flex-col w-full gap-2 lg:max-w-[calc(50%-8px)] bg-white p-4 rounded-lg border-1 border-gray-300 shadow-xs ${!disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <h2 className="text-lg md:text-xl font-bold">Viagem em Andamento</h2>
            <p className="text-sm text-gray-600 mb-2">ID da Viagem: <span className="font-mono bg-gray-100 p-1 rounded">{tripId}</span></p>
            <div className="flex w-full justify-center flex-wrap sm:flex-nowrap gap-2">
                <GenericButton onClick={onToggleUpdate} disabled={!disabled} className="w-full disabled:cursor-not-allowed" colors={`${isUpdatingPosition ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}>
                    {isUpdatingPosition ? 'Pausar Envio' : 'Continuar Viagem'}
                </GenericButton>

                <GenericButton onClick={handleEndTrip} disabled={!disabled} className="w-full disabled:cursor-not-allowed" colors="bg-red-600 hover:bg-red-700 disabled:bg-gray-400">
                    {isLoading ? 'Encerrando...' : 'Encerrar Viagem'}
                </GenericButton>
        
                
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        </div>
    );
};

export default ActiveTripPanel;