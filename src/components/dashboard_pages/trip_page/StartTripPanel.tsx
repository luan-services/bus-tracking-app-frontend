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

const StartTripPanel = ({ onTripStart, disabled }: StartTripPanelProps) => {
    const [lines, setLines] = useState<Line[]>([]);
    const [selectedLine, setSelectedLine] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // useEffect para buscar as linhas disponíveis, só roda uma vez
    useEffect(() => {
        const fetchLines = async () => { // define uma função dentro do useEffect para pedir a lista de linhas pro backend, como a função
        // só será usada dentro desse effect uma única vez, é boa prática escrevê-la aqui dentro 
            try {
                const response = await fetchFromClient('/api/lines/'); //envia o request
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Falha ao buscar as linhas.'); // se a resposta vier com message, lança um 
                // error com a mensagem da resposta, caso contrário lança um erro com a mensagem 'Falha ao buscar as linhas
                setLines(data);
                if (data.length > 0) {
                    setSelectedLine(data[0]._id); // seta a primeira linha como selecionada
                }
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message)
                }
                else {
                    setError('Um erro desconhecido ocorreu.')
                }
            }
        };

        fetchLines();

    }, []);


    // função para iniciar trip, pega a posição atual e faz uma chamada à startTrip.
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
                            //lng: longitude, lat: latitude
                            lng: -44.31804, lat: -23.00953
                        }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || 'Erro ao iniciar a viagem.');
                    }
                    
                    onTripStart(data.trip._id); // chama onTripStart, função do pai que pega os dados da trip baseado no id da trip passado,
                    // conecta ao socket, e distrubui os dados entre os componentes  

                } catch (err) {
                    if (err instanceof Error) {
                        setError(err.message)
                    }
                    else {
                        setError('Um erro desconhecido ocorreu.')
                    }
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
        <div className={`flex flex-col w-full lg:max-w-[calc(50%-8px)] bg-white border-1 border-gray-300 gap-2 p-4 rounded-lg shadow-xs ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}>
            <h2 className="text-lg md:text-xl font-bold">Iniciar Nova Viagem</h2>
            <GenericDropdown options={lines.map((line) => ({_id: line._id, optionText: `${line.lineNumber} - ${line.name}`}))} value={selectedLine} onChange={(id: string) => setSelectedLine(id)} placeholder={lines.length === 0 ? "Carregando linhas..." : "Selecione uma linha"} disabled={disabled || lines.length === 0}/>
            <GenericButton onClick={handleStartTrip} disabled={disabled || isLoading || !selectedLine} className="w-full disabled:cursor-not-allowed">
                {isLoading ? 'Iniciando...' : 'Iniciar Viagem'}
            </GenericButton>
            <div className="flex items-center text-red-500 text-sm">{error ? error : ""}</div>
        </div>
    );
};

export default StartTripPanel;