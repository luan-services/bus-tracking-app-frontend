'use client';

import { useState } from 'react';
import { fetchFromClient } from '@/lib/api-client';

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
        <div className={`flex flex-col w-full bg-white p-4 rounded-lg shadow-md ${!disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <h2 className="text-xl font-bold mb-4">Viagem em Andamento</h2>
            <div className="space-y-4">
                <p className="text-sm text-gray-600">ID da Viagem: <span className="font-mono bg-gray-100 p-1 rounded">{tripId}</span></p>
                <div className="flex space-x-4">
                    <button
                        onClick={onToggleUpdate}
                        disabled={!disabled}
                        className={`w-full font-bold py-2 px-4 rounded-md transition-colors ${
                            isUpdatingPosition 
                                ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {isUpdatingPosition ? 'Pausar Envio' : 'Continuar Viagem'}
                    </button>
                    <button
                        onClick={handleEndTrip}
                        disabled={!disabled || isLoading}
                        className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400"
                    >
                        {isLoading ? 'Encerrando...' : 'Encerrar Viagem'}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
        </div>
    );
};

export default ActiveTripPanel;