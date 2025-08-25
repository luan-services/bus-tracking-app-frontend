// src/components/TimelineItem.tsx (exemplo de caminho)

import { Stop } from '@/types/index'; // Supondo que você tenha o tipo Stop definido

interface TimelineItemProps {
    stop: Stop;
    index: number;
    isReached: boolean;
    etaMinutes?: number;
}

export const TimelineItem = ({ stop, index, isReached, etaMinutes }: TimelineItemProps) => {
    // Define as classes com base no estado 'isReached'
    const itemClasses = isReached ? 'text-gray-400' : 'text-gray-800';
    const iconBgClasses = isReached ? 'bg-gray-400' : 'bg-green-500';

    return (
        <div className={`flex items-center gap-4 ${itemClasses}`}>
            {/* Ícone: Renderiza '✓' ou o número do índice diretamente com JSX */}
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm ${iconBgClasses}`}>
                {isReached ? '✓' : index + 1}
            </div>

            {/* Nome da Parada */}
            <div className="flex-grow">
                <p className="font-medium">{stop.name}</p>
            </div>

            {/* ETA: Renderização condicional do tempo estimado */}
            <div className="text-sm">
                {!isReached && etaMinutes !== undefined && (
                    <span className="font-semibold text-indigo-600">
                        {etaMinutes === 0 ? 'Chegando' : `${etaMinutes} min`}
                    </span>
                )}
            </div>
        </div>
    );
};