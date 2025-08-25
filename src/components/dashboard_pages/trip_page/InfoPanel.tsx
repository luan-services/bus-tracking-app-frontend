// Seu arquivo InfoPanel.tsx atualizado

'use client';

import { LiveTripData } from '@/types/index';
import { TimelineItem } from './TimelineItem'; // Importe o novo componente

interface InfoPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    liveData: LiveTripData | null;
}

// quando uma viagem começa no meio do caminho (e em alguns saltos especificos de distancia (quando o gps cai)), algumas paradas nunca
// são marcadas como alcançadas no objeto da trip. Isso é algo raro, porém é uma experiência frustrante paradas já passadas aparecerem
// 'verdes' no mapa. Por conta disso, esse código implementa um check de distância para remover a cor verde das stops no frontend.


export const InfoPanel = ({ liveData }: InfoPanelProps) => {
    // Se não houver dados, podemos retornar um componente de estado vazio mais cedo.
    // Isso é chamado de "early return" e simplifica o JSX principal.
    if (!liveData) {
        return (
            <div className="flex flex-col bg-white p-4 rounded-lg border-1 border-gray-300 shadow-xs gap-4">
                <h2 className="text-lg md:text-xl font-bold">Status da Viagem</h2>
                <p className="text-gray-500 text-center">Nenhuma viagem ativa.</p>
            </div>
        );
    }

    const progressPercentage = (liveData.distanceTraveled / liveData.totalRouteLength) * 100;
    const etaMap = new Map(liveData.stopETAs.map(eta => [eta.stopName, eta.etaMinutes]));

    return (
        <div className="flex flex-col bg-white p-4 rounded-lg border-1 border-gray-300 shadow-xs gap-4">
            {/* Seção de Status da Viagem (sem alterações) */}
            <div>
                <h2 className="text-lg md:text-xl font-bold">Status da Viagem</h2>
                <div className="flex flex-col gap-2 mt-2"> {/* Adicionado mt-2 para espaçamento */}
                    <label className="text-sm font-medium text-gray-500">Progresso da Rota</label>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, progressPercentage)}%` }} />
                    </div>
                    <span className="text-xs text-right text-gray-500 mt-1">
                        {liveData.distanceTraveled.toFixed(2)} km / {liveData.totalRouteLength.toFixed(2)} km
                    </span>
                    <div className="p-2 flex flex-wrap justify-between text-sm border-b border-gray-300">
                        <span className="text-gray-500 w-40">Posição Real (GPS)</span>
                        <span className="text-gray-500">{liveData.rawPosition[1].toFixed(5)}, {liveData.rawPosition[0].toFixed(5)}</span>
                    </div>
                    <div className="px-2 flex flex-wrap justify-between text-sm border-gray-300">
                        <span className="text-gray-500 w-40">Posição na Rota</span>
                        <span className="text-gray-500">{liveData.snappedPosition[1].toFixed(5)}, {liveData.snappedPosition[0].toFixed(5)}</span>
                    </div>
                </div>
            </div>

            {/* Seção da Linha do Tempo da Viagem (Refatorada) */}
            <div>
                <h2 className="text-lg md:text-xl font-bold">Linha do Tempo da Viagem</h2>
                <div className="space-y-4 max-h-[55vh] overflow-y-auto p-3 mt-2"> {/* Adicionado mt-2 */}
                    {liveData.stops.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">Nenhum dado de paradas disponível.</div>
                    ) : (
                        liveData.stops.map((stop, index) => {
                            // A lógica para determinar se a parada foi alcançada permanece a mesma
                            const isReached = stop.distanceFromStart <= liveData.distanceTraveled || liveData.stopsReached.includes(stop.name);
                            const etaMinutes = etaMap.get(stop.name);

                            // Renderiza o componente TimelineItem, passando as props necessárias
                            return (
                                <TimelineItem
                                    key={stop._id}
                                    stop={stop}
                                    index={index}
                                    isReached={isReached}
                                    etaMinutes={etaMinutes}
                                />
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};