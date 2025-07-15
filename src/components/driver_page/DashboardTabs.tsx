// src/components/driver_page/DashboardTabs.tsx

"use client"; // ESSENCIAL: Este componente precisa de interatividade no navegador.

import { useState } from 'react';
import ProfileTab from './ProfileTab';
import HistoryTab from './HistoryTab';

// importando o type criado (UserProfile)
import { UserProfile } from '@/types';



export default function DashboardTabs({ user }: { user: UserProfile }) {
  // useState: A "memória" do decorador para saber qual aba está acesa.
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');

  // Estilos para os botões das abas
  const tabStyles = "px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200";
  const activeTabStyles = "border-b-2 border-blue-600 text-blue-600";
  const inactiveTabStyles = "text-gray-500 hover:text-gray-700 border-b-2 border-transparent";

  return (
    <div>
      {/* Os "interruptores" para trocar de aba */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`${tabStyles} ${activeTab === 'profile' ? activeTabStyles : inactiveTabStyles}`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${tabStyles} ${activeTab === 'history' ? activeTabStyles : inactiveTabStyles}`}
          >
            Histórico
          </button>
        </nav>
      </div>

      {/* A área onde o conteúdo da aba selecionada aparece */}
      <div className="mt-6">
        {activeTab === 'profile' && <ProfileTab user={user} />}
        {activeTab === 'history' && <HistoryTab />}
      </div>
    </div>
  );
}