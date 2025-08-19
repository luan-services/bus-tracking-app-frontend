'use client';

import { LiveTripData } from '@/types/trip';

interface InfoPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    liveData: LiveTripData | null;
}

// os exports aqui são default pq os imports no page são dinâmicos, fica mais fácil assim

// esse componente não modifica dado algum, ele é responsável apenas pela exibição das informações.

// quando uma viagem começa no meio do caminho (e em alguns saltos especificos de distancia (quando o gps cai)), algumas paradas nunca
// são marcadas como alcançadas no objeto da trip. Isso é algo raro, porém é uma experiência frustrante paradas já passadas aparecerem
// 'verdes' no mapa. Por conta disso, esse código implementa um check de distância para remover a cor verde das stops no frontend.

// const InfoPanel: React.FC<InfoPanelProps> = ({ liveData })
const InfoPanel = ({ liveData }: InfoPanelProps) => {
    // pega o progresso da trip em % para usar na barra de porcentagem
    const progressPercentage = liveData ? (liveData.distanceTraveled / liveData.totalRouteLength) * 100 : 0;

    // cria um objeto Map, com key e value [eta.stopName, eta.etaMinutes] similar ao dict em python
    const etaMap = new Map(liveData?.stopETAs.map(eta => [eta.stopName, eta.etaMinutes]));

    return (
        <div className="flex flex-col bg-white p-4 rounded-lg border-1 border-gray-300 shadow-xs gap-4">
                <h2 className="text-lg md:text-xl font-bold">Status da Viagem</h2>
                {!liveData ?  <p className="text-gray-500 text-center">Nenhuma viagem ativa.</p> : 
                    <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-500">Progresso da Rota</label>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, progressPercentage)}%` }}></div>
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
                }
            

            <div className="flex flex-col gap-2">
                <h2 className="text-lg md:text-xl font-bold">Linha do Tempo da Viagem</h2>
                <div className="space-y-4 max-h-[55vh] overflow-y-auto p-3">
                    {!liveData || liveData.stops.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">Nenhum dado de paradas disponível.</div>
                    ) : (
                        // IMPLEMENTAÇÃO DO CHECK DE DISTÂNCIA AQUI (precisa ser aprimorado)
                        liveData.stops.map((stop, index) => {
                            
                            // checa se a parada foi passada
                            const isReached = stop.distanceFromStart <= liveData.distanceTraveled || liveData.stopsReached.includes(stop.name)
                            
                            // pega o eta dela do etaMap, se existir
                            const etaMinutes = etaMap.get(stop.name);
                            
                            const itemClasses = isReached ? 'text-gray-400' : 'text-gray-800';
                            const iconBgClasses = isReached ? 'bg-gray-400' : 'bg-green-500';
                            const iconCheck = '✓';
                            const iconHTML = isReached 
                                ? `<div class="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-sm">${iconCheck}</div>`
                                : `<div class="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xs">${index + 1}</div>`;

                            // faz um texto do eta
                            const etaText = (etaMinutes !== undefined && etaMinutes !== null && !isReached) 
                                ? `<span class="font-semibold text-indigo-600">${etaMinutes === 0 ? 'Chegando' : `${etaMinutes} min`}</span>`
                                : '';


                            // inclui os dados

                            // precisa ser modifcado, acho que removerei a const etaMinutes.
                            return (
                                <div key={stop._id} className={`flex items-center gap-4 ${itemClasses}`}>
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-full ${iconBgClasses}`} dangerouslySetInnerHTML={{ __html: iconHTML }} />
                                    <div className="flex-grow">
                                        <p className="font-medium">{stop.name}</p>
                                    </div>
                                    <div className="text-sm" dangerouslySetInnerHTML={{ __html: etaText }} />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

        </div>
    );
};

export default InfoPanel;