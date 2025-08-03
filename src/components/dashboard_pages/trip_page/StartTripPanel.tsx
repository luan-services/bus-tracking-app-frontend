'use client';

import { useState, useEffect } from 'react';
import { fetchFromClient } from '@/lib/api-client';
import { Line } from '@/types/trip';
import { GenericButton } from '@/components/general_components/GenericButton';
import { GenericDropdown } from '@/components/general_components/GenericDropDown';

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
                            lng: longitude, lat: latitude
                            // lng: -44.31804, lat: -23.00953
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
        <div className={`flex flex-col w-full lg:max-w-[calc(50%-4px)] bg-white border-1 border-gray-200 p-4 rounded-lg shadow-md ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <h2 className="text-lg md:text-xl font-bold">Iniciar Nova Viagem</h2>
                <div className="flex flex-col py-2">
                    <label htmlFor="line-select" className="text-sm font-medium text-gray-500">
                        Selecione a linha:
                    </label>
                    <GenericDropdown 
                        options={lines.map((line) => ({_id: line._id, optionText: `${line.lineNumber} - ${line.name}`}))} 
                        value={selectedLine} 
                        onChange={(e) => setSelectedLine(e.target.value)} 
                        placeholder={lines.length === 0 ? "Carregando linhas..." : "Selecione uma linha"}
                        disabled={disabled || lines.length === 0}
                    />
                </div>
                <GenericButton onClick={handleStartTrip} disabled={disabled || isLoading || !selectedLine} className="w-full disabled:cursor-not-allowed">
                    {isLoading ? 'Iniciando...' : 'Iniciar Viagem'}
                </GenericButton>
                <div className="flex items-center text-red-500 text-sm min-h-13">{error ? error : ""}</div>
        </div>
    );
};

export default StartTripPanel;




/*                                         <select id="line-select" value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)} disabled={disabled || lines.length === 0}
                        className="w-full px-2 py-2 border-1 border-gray-500 rounded-xs focus:outline-none focus:border-indigo-500 sm:text-sm disabled:cursor-not-allowed">
                        {lines.length > 0 ? 
                            lines.map((line) => (
                                <option className="px-2" key={line._id} value={line._id}>
                                    {line.lineNumber} - {line.name}
                                </option>
                            )) : <option>Carregando linhas...</option>
                        }
                    </select> */