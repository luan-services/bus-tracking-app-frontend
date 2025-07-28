'use client';

import { useState, useEffect } from 'react';
import { fetchFromClient } from '@/lib/api-client';
import { Line } from '@/types/trip';

interface StartTripPanelProps {
    onTripStart: (tripId: string) => void;
    disabled: boolean;
}

const StartTripPanel: React.FC<StartTripPanelProps> = ({ onTripStart, disabled }) => {
    const [lines, setLines] = useState<Line[]>([]);
    const [selectedLine, setSelectedLine] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Busca as linhas disponíveis
    useEffect(() => {
        const fetchLines = async () => {
            try {
                const response = await fetchFromClient('/api/lines/');
                if (!response.ok) throw new Error('Falha ao buscar as linhas.');
                const data = await response.json();
                setLines(data);
                if (data.length > 0) {
                    setSelectedLine(data[0]._id);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro desconhecido');
            }
        };
        fetchLines();
    }, []);

    const handleStartTrip = async () => {
        if (!selectedLine) {
            setError('Por favor, selecione uma linha.');
            return;
        }

        setIsLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetchFromClient('/api/trips/start', {
                        method: 'POST',
                        body: JSON.stringify({
                            lineId: selectedLine,
                            lat: latitude,
                            lng: longitude,
                        }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || 'Erro ao iniciar a viagem.');
                    }
                    
                    onTripStart(data.trip._id);

                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Erro desconhecido');
                } finally {
                    setIsLoading(false);
                }
            },
            (geoError) => {
                setError(`Erro de geolocalização: ${geoError.message}`);
                setIsLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <div className={`bg-white p-4 rounded-lg shadow-md ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <h2 className="text-xl font-bold mb-4">Iniciar Nova Viagem</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="line-select" className="block text-sm font-medium text-gray-700">
                        Selecione a Linha
                    </label>
                    <select
                        id="line-select"
                        value={selectedLine}
                        onChange={(e) => setSelectedLine(e.target.value)}
                        disabled={disabled || lines.length === 0}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        {lines.length > 0 ? (
                            lines.map((line) => (
                                <option key={line._id} value={line._id}>
                                    {line.lineNumber} - {line.name}
                                </option>
                            ))
                        ) : (
                            <option>Carregando linhas...</option>
                        )}
                    </select>
                </div>
                <button
                    onClick={handleStartTrip}
                    disabled={disabled || isLoading || !selectedLine}
                    className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                    {isLoading ? 'Iniciando...' : 'Iniciar Viagem'}
                </button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
        </div>
    );
};

export default StartTripPanel;