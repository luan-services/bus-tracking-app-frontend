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
    const [selectedLine, setSelectedLine] = useState<string>('');
    const router = useRouter();

    const handleNavigateToLine = () => {
        if (selectedLine) {
            router.push(`/lines/${selectedLine}`);
        }
    };

    return (
        <div className="flex flex-col px-6 py-10 gap-6 rounded-lg border-1 bg-white border-gray-300 shadow-lg items-center w-88 h-108">

            <div className="flex w-full flex-col gap-2">
                
                <span className="font-bold text-xl">Linhas</span>
                
                <div className="border-b-1 w-full border-custom-light-green-2"></div>

                <span className="text-sm text-gray-700">Acompanhe em tempo real os ônibus da linha desejada.</span>
            </div>

            
            <div className="flex w-full flex-col gap-2">
                    
                    
                <span className="text-sm text-gray-700">Você pode ver detalhes como: rotas, posição do ônibus, tempo estimado de chega, itinerário, horários e muito mais!</span>

                <GenericDropdown
                    options={lines.map((line) => ({ _id: line._id, optionText: `${line.lineNumber} - ${line.name}` }))}
                    value={selectedLine}
                    onChange={(id: string) => setSelectedLine(id)}
                    placeholder="Selecione uma linha"
                    disabled={lines.length === 0}/>
                    


            </div>


            <div className="border-b-1 w-full border-custom-light-green-2"></div>

            <div className="flex w-full gap-4 items-center justify-around">
                <div className="flex flex-col">
                    <span className="font-bold text-gray-700">Valor da Passagem:</span>
                    <span className="text-gray-700">R$ valor</span>
                </div>
                
                <GenericButton onClick={handleNavigateToLine} disabled={!selectedLine} className="w-32 py-2 font-medium">
                    Ver Detalhes
                </GenericButton>
            </div>
        </div>
    );
};