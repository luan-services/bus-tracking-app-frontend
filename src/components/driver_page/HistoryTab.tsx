// src/app/driver/_components/HistoryTab.tsx

"use client"; // Precisa buscar dados no navegador e ter estado.

import { useState, useEffect } from 'react';

interface Trip {
  id: string;
  lineName: string; // Ajuste conforme seu backend
  startTime: string;
  endTime: string;
}

export default function HistoryTab() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect: Roda assim que o componente aparece na tela.
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/driver/history'); // Chama a API segura do Next.js
        if (!res.ok) throw new Error('Falha ao buscar o histórico.');
        const data = await res.json();
        setTrips(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []); // [] significa: rode esta função apenas uma vez.

  if (loading) return <p className="text-gray-500">Carregando histórico...</p>;
  if (error) return <p className="text-red-500">Erro: {error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Histórico de Viagens</h2>
      {trips.length === 0 ? (
        <p>Nenhuma viagem encontrada.</p>
      ) : (
        <ul className="space-y-4">
          {trips.map((trip) => (
            <li key={trip.id} className="p-4 border rounded-lg bg-gray-50">
              <p className="font-bold">Linha: {trip.lineName}</p>
              <p className="text-sm text-gray-600">Início: {new Date(trip.startTime).toLocaleString('pt-BR')}</p>
              <p className="text-sm text-gray-600">Fim: {new Date(trip.endTime).toLocaleString('pt-BR')}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}