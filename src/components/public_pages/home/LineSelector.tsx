'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GenericButton } from '@/components/general_components/GenericButton';
import { GenericDropdown } from '@/components/general_components/GenericDropDown';

// Supondo que o tipo Line venha de @/types/trip ou similar
interface Line {
    _id: string;
    name: string;
    lineNumber: string;
}

interface LineSelectorProps {
    lines: Line[];
}

export const LineSelector = ({ lines }: LineSelectorProps) => {
    const [selectedLine, setSelectedLine] = useState<string>(lines[0]?._id || '');
    const router = useRouter();

    const handleNavigateToLine = () => {
        if (selectedLine) {
            router.push(`/lines/${selectedLine}`);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                Consulte sua Linha
            </h2>
            <GenericDropdown
                options={lines.map((line) => ({ _id: line._id, optionText: `${line.lineNumber} - ${line.name}` }))}
                value={selectedLine}
                onChange={(id: string) => setSelectedLine(id)}
                placeholder="Selecione uma linha"
                disabled={lines.length === 0}
            />
            <GenericButton
                onClick={handleNavigateToLine}
                disabled={!selectedLine}
                className="w-full mt-4"
            >
                Ver Detalhes da Linha
            </GenericButton>
        </div>
    );
};