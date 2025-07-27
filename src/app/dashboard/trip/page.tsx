"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { fetchFromClient } from '@/lib/api-client';
import type { Line, TripLiveData, PositionUpdateData, Stop } from '@/types/trip';
import { io, Socket } from 'socket.io-client';
import { Play, Pause, StopCircle, Check } from 'lucide-react';
import L from 'leaflet';

// --- DEFINIÇÃO DOS ÍCONES DO MAPA ---
// Ícone para o ônibus, usando SVG para um visual limpo e customizável.
const busIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="color: #4f46e5; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.4));"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`;
const busIcon = new L.DivIcon({
  html: busIconSvg,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});
// Ícone para a posição real (GPS) do motorista.
const rawPositionIcon = new L.DivIcon({
    html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
});

// --- COMPONENTE DO MAPA ---
// Importado dinamicamente para garantir que só rode no cliente (CSR)
const MapView = dynamic(() => import('@/components/dashboard/trip_page/MapView'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full bg-gray-100"><p>Carregando mapa...</p></div>
});


// Define os possíveis estados da nossa UI
type TripStatus = 'CHECKING' | 'NO_TRIP_ACTIVE' | 'TRIP_ACTIVE';

export default function TripPage() {
  const [status, setStatus] = useState<TripStatus>('CHECKING');
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para a viagem ativa
  const [tripData, setTripData] = useState<TripLiveData | null>(null);
  const [positionUpdate, setPositionUpdate] = useState<PositionUpdateData | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);


  // Efeito principal para verificar o status inicial da viagem do motorista
  useEffect(() => {
    const checkUserTripStatus = async () => {
      setStatus('CHECKING');
      setError(null);
      try {
        const response = await fetchFromClient('/api/trips/user-status/');
        const data = await response.json();

        if (response.status === 200 && data.trip_id) {
          setActiveTripId(data.trip_id);
          setStatus('TRIP_ACTIVE');
        } else if (response.status === 201) {
          setStatus('NO_TRIP_ACTIVE');
          const linesResponse = await fetchFromClient('/api/lines/');
          if (!linesResponse.ok) throw new Error('Falha ao carregar as linhas de ônibus.');
          const linesData = await linesResponse.json();
          setLines(linesData);
        } else {
          throw new Error(data.message || 'Falha ao verificar status da viagem.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message);
        setStatus('NO_TRIP_ACTIVE');
      }
    };

    checkUserTripStatus();
  }, []);

  // Efeito para buscar dados da viagem e conectar ao socket quando uma viagem se torna ativa
  useEffect(() => {
    if (status !== 'TRIP_ACTIVE' || !activeTripId) {
      return;
    }

    const fetchInitialTripData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchFromClient(`/api/trips/${activeTripId}/track`);
        if (!response.ok) throw new Error("Falha ao carregar dados da viagem.");
        const data: TripLiveData = await response.json();
        setTripData(data);
        setPositionUpdate(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialTripData();

    const socket: Socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001");
    socket.emit('joinTrip', activeTripId);
    socket.on('positionUpdate', (data: PositionUpdateData) => setPositionUpdate(data));
    socket.on('tripEnded', () => {
      alert('A viagem foi finalizada.');
      handleTripEnded();
    });

    return () => { socket.disconnect(); };
  }, [status, activeTripId]);

  // Efeito para enviar a posição periodicamente
  useEffect(() => {
    if (isPaused || status !== 'TRIP_ACTIVE' || !activeTripId) {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
      return;
    }

    if (!intervalIdRef.current) {
      intervalIdRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          fetchFromClient(`/api/trips/${activeTripId}/position`, {
            method: 'PATCH',
            body: JSON.stringify({ lat: latitude, lng: longitude }),
          });
        }, null, { enableHighAccuracy: true });
      }, 5000);
    }

    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    };
  }, [isPaused, status, activeTripId]);

  // --- Funções de Manipulação de Eventos ---

  const handleStartTrip = () => {
    if (!selectedLineId) {
      setError("Por favor, selecione uma linha.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await fetchFromClient('/api/trips/start', {
          method: 'POST',
          body: JSON.stringify({
            lineId: selectedLineId,
            lat: latitude,
            lng: longitude,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Erro desconhecido ao iniciar a viagem.");
        }
        setActiveTripId(data.trip._id);
        setStatus('TRIP_ACTIVE');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }, (geoError) => {
      setError("Não foi possível obter sua localização. Verifique as permissões do navegador.");
      setIsLoading(false);
    });
  };

  const handleEndTrip = async () => {
    if (window.confirm("Tem certeza que deseja encerrar esta viagem?")) {
      try {
        const response = await fetchFromClient(`/api/trips/${activeTripId}/end`, { method: 'PATCH' });
        if (!response.ok) throw new Error("Falha ao encerrar a viagem.");
        // O evento 'tripEnded' do socket vai cuidar da transição do estado
      } catch (err: any) { setError(err.message); }
    }
  };

  const handleTripEnded = async () => {
    setStatus('NO_TRIP_ACTIVE');
    setActiveTripId(null);
    setTripData(null);
    setPositionUpdate(null);
    try {
      const linesResponse = await fetchFromClient('/api/lines/');
      if (!linesResponse.ok) throw new Error('Falha ao recarregar as linhas.');
      setLines(await linesResponse.json());
    } catch (err: any) {
      setError(err.message);
    }
  };

  // --- Renderização ---
  
  const renderContent = () => {
    if (status === 'CHECKING' || (status === 'TRIP_ACTIVE' && isLoading)) {
      return <p className="text-gray-500 animate-pulse text-center">Carregando...</p>;
    }
    if (error) {
      return <div className="text-red-500 bg-red-100 p-4 rounded-md">Erro: {error}</div>;
    }
    
    if (status === 'NO_TRIP_ACTIVE') {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700">Nenhuma viagem em andamento</h2>
          <div className="w-full max-w-md">
            <label htmlFor="line-select" className="block text-sm font-medium text-gray-700 mb-2">Selecione uma linha para começar:</label>
            <select
              id="line-select"
              value={selectedLineId}
              onChange={(e) => setSelectedLineId(e.target.value)}
              className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              <option value="" disabled>Escolha uma linha...</option>
              {lines.map((line) => (
                <option key={line._id} value={line._id}>{line.lineNumber} - {line.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleStartTrip}
            disabled={isLoading || !selectedLineId}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Play size={20} />
            {isLoading ? 'Iniciando...' : 'Iniciar Viagem'}
          </button>
        </div>
      );
    }

    if (status === 'TRIP_ACTIVE' && tripData && positionUpdate) {
      const progressPercentage = (positionUpdate.distanceTraveled / positionUpdate.totalRouteLength) * 100;
      const etaMap = new Map((positionUpdate.stopETAs || []).map(eta => [eta.stopName, eta.etaMinutes]));

      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Coluna do Mapa */}
          <div className="lg:col-span-2 h-64 lg:h-full rounded-lg overflow-hidden border">
            <MapView tripData={tripData} positionUpdate={positionUpdate} />
          </div>

          {/* Coluna de Status e Timeline */}
          <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-around p-4 bg-gray-100 rounded-lg">
              <button onClick={() => setIsPaused(!isPaused)} className={`px-4 py-2 text-sm md:px-6 md:py-2 rounded-lg text-white font-semibold flex items-center gap-2 transition-colors ${isPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}>
                {isPaused ? <Play size={18}/> : <Pause size={18}/>}
                {isPaused ? 'Continuar' : 'Pausar'}
              </button>
              <button onClick={handleEndTrip} className="px-4 py-2 text-sm md:px-6 md:py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center gap-2 transition-colors">
                <StopCircle size={18}/>
                Encerrar
              </button>
            </div>
            
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="font-bold text-lg">Status da Viagem</h3>
              <div>
                <label className="block text-sm font-medium text-gray-500">Progresso</label>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1"><div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, progressPercentage)}%` }}></div></div>
                <p className="text-xs text-right text-gray-500 mt-1">{positionUpdate.distanceTraveled.toFixed(2)} km / {positionUpdate.totalRouteLength.toFixed(2)} km</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg flex-grow overflow-y-auto">
              <h3 className="font-bold text-lg mb-4">Linha do Tempo</h3>
              <div className="space-y-4">
                {tripData.stops.map((stop, index) => {
                    const isPast = positionUpdate.stopsReached.includes(stop.name);
                    const etaMinutes = etaMap.get(stop.name);
                    const etaText = () => {
                        if (isPast || etaMinutes === undefined || etaMinutes === null) return null;
                        if (etaMinutes === 0) return <span className="font-semibold text-indigo-600">Chegando</span>;
                        return <span className="font-semibold text-indigo-600">{etaMinutes} min</span>;
                    };
                    return (
                        <div key={stop.name} className={`flex items-center gap-4 ${isPast ? 'text-gray-400' : 'text-gray-800'}`}>
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${isPast ? 'bg-gray-400' : 'bg-green-500'}`}>
                                {isPast ? <Check size={16} /> : index + 1}
                            </div>
                            <div className="flex-grow"><p className="font-medium">{stop.name}</p></div>
                            <div className="text-sm">{etaText()}</div>
                        </div>
                    );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Viagem</h1>
      <div className="flex-grow bg-white p-6 rounded-lg shadow-md">
        {renderContent()}
      </div>
    </div>
  );
}