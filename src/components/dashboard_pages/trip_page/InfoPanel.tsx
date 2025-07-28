'use client';

import { LiveTripData } from '@/types/trip';

interface InfoPanelProps {
    liveData: LiveTripData | null;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ liveData }) => {
    const progressPercentage = liveData ? (liveData.distanceTraveled / liveData.totalRouteLength) * 100 : 0;
    const etaMap = new Map(liveData?.stopETAs.map(eta => [eta.stopName, eta.etaMinutes]));

    return (
        <div className="bg-white p-4 rounded-lg shadow-md space-y-6">
            <div>
                <h2 className="text-xl font-bold mb-4">Status da Viagem</h2>
                {!liveData ? (
                    <p className="text-gray-500">Nenhuma viagem ativa.</p>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Progresso da Rota</label>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, progressPercentage)}%` }}></div>
                            </div>
                            <p className="text-xs text-right text-gray-500 mt-1">
                                {liveData.distanceTraveled.toFixed(2)} km / {liveData.totalRouteLength.toFixed(2)} km
                            </p>
                        </div>
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-2 font-medium text-gray-600">Posição Real (GPS)</td>
                                    <td className="py-2 text-right font-mono">{liveData.rawPosition[1].toFixed(5)}, {liveData.rawPosition[0].toFixed(5)}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 font-medium text-gray-600">Posição na Rota</td>
                                    <td className="py-2 text-right font-mono">{liveData.snappedPosition[1].toFixed(5)}, {liveData.snappedPosition[0].toFixed(5)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-xl font-bold mb-2">Linha do Tempo da Viagem</h2>
                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
                    {!liveData || liveData.stops.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">Nenhum dado de paradas disponível.</div>
                    ) : (
                        liveData.stops.map((stop, index) => {
                            const isReached = liveData.stopsReached.includes(stop.name);
                            const etaMinutes = etaMap.get(stop.name);
                            
                            const itemClasses = isReached ? 'text-gray-400' : 'text-gray-800';
                            const iconBgClasses = isReached ? 'bg-gray-400' : 'bg-green-500';
                            const iconCheck = '✓';
                            const iconHTML = isReached 
                                ? `<div class="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-sm">${iconCheck}</div>`
                                : `<div class="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xs">${index + 1}</div>`;

                            const etaText = (etaMinutes !== undefined && etaMinutes !== null && !isReached) 
                                ? `<span class="font-semibold text-indigo-600">${etaMinutes === 0 ? 'Chegando' : `${etaMinutes} min`}</span>`
                                : '';

                            return (
                                <div key={stop._id} className={`flex items-center gap-4 ${itemClasses}`}>
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full ${iconBgClasses}`} dangerouslySetInnerHTML={{ __html: iconHTML }} />
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