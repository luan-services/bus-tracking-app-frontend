// src/components/driver_page/HistoryTab.tsx

"use client"; // Precisa buscar dados no navegador e ter estado.

import { useState, useEffect } from 'react';

interface Trip {
  _id: string;
  updatedAt: string;
  startTime: string;
  line: {
    _id: string;
    lineNumber: string;
    name: string;
  };
  driver: {
    _id: string;
  };
}


export default function TripsTab() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect: Roda assim que o componente aparece na tela.
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/driver/trips'); // Chama a API segura do Next.js (manda requisição pro frontend)
        if (!res.ok) throw new Error('Falha ao buscar o histórico.');
        const data = await res.json();
        setTrips(data);
      } catch (err: any) {
        console.log(err)
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
          {/* RENDERIZAÇÃO ATUALIZADA: Exibindo os novos campos */}
          {trips.map((trip) => (
            <li key={trip._id} className="p-4 border rounded-lg bg-gray-50 shadow-sm">
              <p><span className="font-bold">ID da Viagem:</span> {trip._id}</p>
              <p><span className="font-bold">Linha:</span> {trip.line.lineNumber} - {trip.line.name}</p>
              <p><span className="font-bold">ID da Linha:</span> {trip.line._id}</p>
              <p><span className="font-bold">ID do Motorista:</span> {trip.driver._id}</p>
              <p className="text-sm text-gray-600 mt-2">
                Início: {new Date(trip.startTime).toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-gray-600">
                Última Atualização: {new Date(trip.updatedAt).toLocaleString('pt-BR')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}