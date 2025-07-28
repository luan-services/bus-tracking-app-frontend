"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { fetchFromClient } from '@/lib/api-client';
import { TripStatus, LiveTripData } from '@/types/trip';

// Import dinâmico para componentes client-side
import dynamic from 'next/dynamic';
const StartTripPanel = dynamic(() => import('@/components/dashboard_pages/trip_page/StartTripPanel'), { ssr: false });
const ActiveTripPanel = dynamic(() => import('@/components/dashboard_pages/trip_page/ActiveTripPanel'), { ssr: false });
const MapPanel = dynamic(() => import('@/components/dashboard_pages/trip_page/MapPanel'), { ssr: false });
const InfoPanel = dynamic(() => import('@/components/dashboard_pages/trip_page/InfoPanel'), { ssr: false });

export default function TripPage() {
    const [tripId, setTripId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [liveData, setLiveData] = useState<LiveTripData | null>(null);
    const [isUpdatingPosition, setIsUpdatingPosition] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const positionIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Função para buscar dados iniciais da viagem
    const fetchInitialTripData = useCallback(async (currentTripId: string) => {
        try {
            const response = await fetchFromClient(`/api/trips/${currentTripId}/track`);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Falha ao buscar dados da viagem.');
            }
            const data: LiveTripData = await response.json();
            setLiveData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar dados.');
            setTripId(null); // Reseta se não conseguir carregar
        }
    }, []);

    // Função para iniciar a conexão com Socket.IO
    const setupSocket = useCallback((currentTripId: string) => {
        if (socketRef.current) socketRef.current.disconnect();

        // ATENÇÃO: Use a URL do seu backend aqui
        const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001');
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket.IO conectado!');
            socket.emit('joinTrip', currentTripId);
        });

        socket.on('positionUpdate', (updateData: Partial<LiveTripData>) => {
            console.log('Posição atualizada via socket:', updateData);
            setLiveData(prevData => {
                // If there's no previous data, something is wrong, but we can return the update.
                if (!prevData) return updateData as LiveTripData;

                // Merge previous data with the new update from the socket
                return { ...prevData, ...updateData };
            });
        });
        
        socket.on('tripEnded', (data: { message: string }) => {
            console.log('Viagem encerrada via socket:', data.message);
            alert(data.message);
            handleTripEnd();
        });

        socket.on('disconnect', () => {
            console.log('Socket.IO desconectado.');
        });

    }, []);

    // Efeito principal para verificar o status da viagem ao carregar a página
    useEffect(() => {
        const checkTripStatus = async () => {
            setIsLoading(true);
            try {
                const response = await fetchFromClient('/api/trips/user-status/');
                const data: TripStatus = await response.json();

                if (response.status === 200 && data.trip_id) {
                    setTripId(data.trip_id);
                    await fetchInitialTripData(data.trip_id);
                    setupSocket(data.trip_id);
                } else {
                    setTripId(null);
                    setLiveData(null);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Não foi possível verificar o status da viagem.');
            } finally {
                setIsLoading(false);
            }
        };
        checkTripStatus();

        // Limpeza ao desmontar o componente
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            if (positionIntervalRef.current) clearInterval(positionIntervalRef.current);
        };
    }, [fetchInitialTripData, setupSocket]);

    // Lógica para enviar atualizações de posição
    const sendPositionUpdate = useCallback(() => {
        if (!tripId) return;

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    await fetchFromClient(`/api/trips/${tripId}/position`, {
                        method: 'PATCH',
                        body: JSON.stringify({ lat: latitude, lng: longitude }),
                    });
                     console.log("Posição enviada com sucesso.");
                } catch (err) {
                    console.error("Erro ao enviar posição:", err);
                    // Para o envio se houver erro (ex: viagem finalizada no backend)
                    setIsUpdatingPosition(false);
                }
            },
            (geoError) => {
                console.error(`Erro de geolocalização: ${geoError.message}`);
                setError(`Erro de geolocalização: ${geoError.message}`);
                setIsUpdatingPosition(false); // Para o envio se não conseguir obter a localização
            },
            { enableHighAccuracy: true }
        );
    }, [tripId]);
    
    // Controla o intervalo de envio de posição
    useEffect(() => {
        if (isUpdatingPosition) {
            // Envia uma vez imediatamente e depois a cada 5 segundos
            sendPositionUpdate(); 
            positionIntervalRef.current = setInterval(sendPositionUpdate, 5000);
        } else {
            if (positionIntervalRef.current) {
                clearInterval(positionIntervalRef.current);
                positionIntervalRef.current = null;
            }
        }
        return () => {
            if (positionIntervalRef.current) clearInterval(positionIntervalRef.current);
        };
    }, [isUpdatingPosition, sendPositionUpdate]);

    // Handlers para eventos dos componentes filhos
    const handleTripStart = (newTripId: string) => {
        setTripId(newTripId);
        fetchInitialTripData(newTripId);
        setupSocket(newTripId);
        setIsUpdatingPosition(true); // Começa a enviar a posição automaticamente
    };
    
    const handleTripEnd = () => {
        if (socketRef.current) socketRef.current.disconnect();
        if (positionIntervalRef.current) clearInterval(positionIntervalRef.current);
        
        setTripId(null);
        setLiveData(null);
        setIsUpdatingPosition(false);
        setError(null);
    };

    const handleToggleUpdate = () => {
        setIsUpdatingPosition(prev => !prev);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><p>Carregando status da viagem...</p></div>;
    }
    
    if (error) {
         return <div className="flex justify-center items-center h-screen"><p className="text-red-500">{error}</p></div>;
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Viagem</h1>
                <p className="text-gray-600">Inicie, gerencie e finalize suas viagens.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna de Controle e Informações */}
                <div className="lg:col-span-1 space-y-6">
                    <StartTripPanel onTripStart={handleTripStart} disabled={!!tripId} />
                    <ActiveTripPanel 
                        tripId={tripId || ''}
                        isUpdatingPosition={isUpdatingPosition}
                        onToggleUpdate={handleToggleUpdate}
                        onTripEnd={handleTripEnd}
                        disabled={!!tripId}
                    />
                     <InfoPanel liveData={liveData} />
                </div>

                {/* Coluna do Mapa */}
                <div className="lg:col-span-2">
                    <MapPanel liveData={liveData} />
                </div>
            </div>
        </div>
    );
}




/*export default function TripPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Trip
      </h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <p>Trip teste...</p>
      </div>
    </div>
  );
}*/