'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

// interface para cada opção à ser passada pro dropdown, ela precisa de um id para saber qual é a opção e um texto que mostra a opção
interface DropdownOption {
	_id: string;
	optionText: string;
}

// interface para as props do dropdown
interface CustomDropdownProps {
	options?: DropdownOption[]; // array de opções que vai ser passado
	value?: string | null;
	onChange: (id: string) => void;
	placeholder?: string;
	disabled?: boolean;
	children?: React.ReactNode; // props que define os children do objeto
}

export const GenericDropdown = ({ options = [], value = null, onChange, placeholder = '', disabled = false}: CustomDropdownProps) => {
	
	// define se o dropdown está aberto ou fechado
	const [isOpen, setIsOpen] = useState(false);

	const [direction, setDirection] = useState<'down' | 'up'>('down'); // state para definir o lado que o dropdown vai abrir

	// useRefs são states que persistem mas não causam re-renderização no DOM quando seus valores são modificados, no caso específico abaixo
	// ele não está sendo usando para guardar dados como os dados da geolocalização, socket, etc. no arquivo page.tsx, mas sim está sendo usado
	// para ter uma referência da div do dropdown, ou seja, saber exatamente qual é a div, para adicionar a logica de saber quando um click 
	// acontece fora dela. Em javascript, poderia ser feito com 'id' e events listener, só que em react onde existe re-renderização, a forma
	// correta de se fazer é com o useRef.
	const dropdownRef = useRef<HTMLDivElement>(null);

	// useEffect para abrir e fechar o dropdown
	useEffect(() => {

		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) { // checa se o click foi fora do useRef da div
				setIsOpen(false); // fecha o dropdown caso sim
			}
		};

		if (isOpen) { // se o dropdown está aberto, adiciona um event listener para click, que roda a função handleClickOutside
			document.addEventListener('mousedown', handleClickOutside);
		}

		// na limpeza, quando o useEffect é recriado (quando isOpen muda) ou quando o componente é desmontado (troca de pagina), remove 
		// o listener
		return () => { 
			document.removeEventListener('mousedown', handleClickOutside);
		};

	}, [isOpen]);
	

	// função para setar a opção selecionada e fechar o dropdown
	const handleOptionClick = (option: DropdownOption) => {
		onChange(option._id); 
		setIsOpen(false);
	};

	// função checar se há espaço para baixo ou para cima do dropdown
    const handleToggleDropdown = () => {
        if (dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const dropdownHeight = 200; // max-h-60 in pixels (60 * 4 = 240px)

            // 1. Posição absoluta do final do dropdown na página inteira
            const absoluteDropdownBottom = window.scrollY + rect.bottom;

            // 2. Espaço total restante na página abaixo do dropdown
            const totalSpaceBelow = document.documentElement.scrollHeight - absoluteDropdownBottom;

            // 3. Espaço disponível acima do dropdown (no viewport)
            const spaceAbove = rect.top;

            // CONDIÇÃO:
            // Abre para cima APENAS SE:
            // - O espaço total abaixo na página for insuficiente E
            // - Houver espaço suficiente acima para o dropdown abrir
            if (totalSpaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                setDirection('up');
            } else {
                setDirection('down');
            }
            // --- FIM DA NOVA LÓGICA ---
        }
        setIsOpen(prev => !prev);
    };

	// encontra o id da opção selecionada (se não houver é null)
	const selectedOption = options.find(opt => opt._id === value) || null;

	// mostra a opção selecionada, mostra o placeholder caso não exista opção selecionada
	const displayValue = selectedOption?.optionText || placeholder

	return (
		<div ref={dropdownRef} className="w-full relative">
			<button type="button" onClick={() => handleToggleDropdown()} disabled={disabled}
				className={`w-full flex justify-between items-center px-2 py-2 border-1 ${isOpen ? direction === 'down' ? "border-blue-500 border-b-gray-200" : "border-blue-500 border-t-gray-200" : "border-gray-400"} rounded-xs text-sm cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-100 focus:outline-none`}>
				<span className="truncate text-gray-700">{displayValue}</span>
				<ChevronDown className="text-gray-500" size={20} strokeWidth={2.5} />
			</button>

			{isOpen && 
				<div className={`absolute w-full max-h-50 overflow-auto p-2 border-1 bg-white border-blue-500 text-sm shadow-b-lg z-[1000] focus:outline-none ${direction === 'down' ? 'top-full border-t-0 rounded-b-xs shadow-[0_4px_14px_0_rgb(0,0,0,0.1)]' : 'bottom-full border-b-0 rounded-t-xs shadow-[0_-4px_14px_0_rgb(0,0,0,0.1)]'}`}>
					{options.length > 0 ? 
						options.map((option) => (
							<div key={option._id} onClick={() => handleOptionClick(option)} className=" transition-colors cursor-pointer rounded-md relative py-2 px-2 text-gray-700 hover:bg-indigo-100">
								{option ? option.optionText : ''}
							</div>
						)) : <div className="py-2 px-4 text-gray-500">Nenhuma opção disponível</div>
					}
				</div>
			}
		</div>
	);
};