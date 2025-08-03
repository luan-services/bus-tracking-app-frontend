'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronsUpDown, ChevronDown } from 'lucide-react';

// A estrutura da opção permanece a mesma
interface DropdownOption {
  _id: string;
  optionText: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  // -> MUDANÇA: 'value' agora é uma string (o ID)
  value: string;
  // -> MUDANÇA: 'onChange' agora imita o evento de um input/select
  onChange: (event: { target: { value: string } }) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const GenericDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecione uma opção",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (option: DropdownOption) => {
    // -> MUDANÇA: Cria um objeto de evento sintético e chama o onChange do pai com ele
    onChange({ target: { value: option._id } });
    setIsOpen(false);
  };

  // -> MUDANÇA: Encontra o objeto da opção selecionada com base no 'value' (string)
  const selectedOption = options.find(opt => opt._id === value);

  // -> MUDANÇA: Usa o 'selectedOption' encontrado para exibir o texto correto
  const displayValue = selectedOption
    ? selectedOption.optionText ? `${selectedOption.optionText}` : ''
    : placeholder;

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        disabled={disabled}
        className="w-full px-2 py-2 border-1 border-gray-500 rounded-xs focus:outline-none focus:border-indigo-500 sm:text-sm disabled:cursor-not-allowed disabled:bg-gray-100 flex justify-between items-center text-left"
      >
        <span className="block truncate">{displayValue}</span>
        <ChevronDown className="text-gray-400" size={20} strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div
          className="absolute mt-1 w-full max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10"
        >
          {options.length > 0 ? (
            options.map((option) => (
              <div
                key={option._id}
                onClick={() => handleOptionClick(option)}
                className="cursor-pointer select-none relative py-2 px-4 text-gray-900 hover:bg-indigo-100"
              >
                {option ? option.optionText : ''}
              </div>
            ))
          ) : (
            <div className="py-2 px-4 text-gray-500">Nenhuma opção disponível</div>
          )}
        </div>
      )}
    </div>
  );
};