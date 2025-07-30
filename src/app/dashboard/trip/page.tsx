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

// NOVO: Função para calcular distância entre duas coordenadas (Fórmula de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distância em metros
}


export default function TripPage() {
    const [tripId, setTripId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [liveData, setLiveData] = useState<LiveTripData | null>(null);
    const [isUpdatingPosition, setIsUpdatingPosition] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    
    // ALTERADO: Substituímos o ref do intervalo pelos refs do watchPosition
    const watchIdRef = useRef<number | null>(null);
    const lastSentTimeRef = useRef<number>(0);
    const lastSentPositionRef = useRef<GeolocationCoordinates | null>(null);

    // As funções fetchInitialTripData e setupSocket permanecem as mesmas
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

    const setupSocket = useCallback((currentTripId: string) => {
        if (socketRef.current) socketRef.current.disconnect();

        const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001');
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket.IO conectado!');
            socket.emit('joinTrip', currentTripId);
        });

        socket.on('positionUpdate', (updateData: Partial<LiveTripData>) => {
            console.log('Posição atualizada via socket:', updateData);
            setLiveData(prevData => {
                if (!prevData) return updateData as LiveTripData;
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

        // ALTERADO: Limpeza ao desmontar o componente para limpar o watch
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [fetchInitialTripData, setupSocket]);

    // A função sendPositionUpdate permanece a mesma
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
                     console.log("Posição enviada com sucesso para o backend.");
                } catch (err) {
                    console.error("Erro ao enviar posição:", err);
                    setIsUpdatingPosition(false);
                }
            },
            (geoError) => {
                console.error(`Erro de geolocalização: ${geoError.message}`);
                setError(`Erro de geolocalização: ${geoError.message}`);
                setIsUpdatingPosition(false);
            },
            { enableHighAccuracy: true }
        );
    }, [tripId]);
    
    // ALTERADO: useEffect totalmente reescrito para controlar o watchPosition
    useEffect(() => {
        // Constantes do filtro
        const MIN_DISTANCE_METERS = 50;
        const MIN_TIME_INTERVAL_MS = 15000; // 15 segundos

        const startWatching = () => {
            if (!('geolocation' in navigator)) {
                setError("Geolocalização não é suportada neste navegador.");
                return;
            }
            
            // Zera os refs de controle ao iniciar um novo rastreamento
            lastSentTimeRef.current = Date.now(); // Inicia o contador de tempo imediatamente
            lastSentPositionRef.current = null;

            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const now = Date.now();
                    const { coords } = position;

                    // Se não houver uma posição anterior, define a atual e sai.
                    if (!lastSentPositionRef.current) {
                        lastSentPositionRef.current = coords;
                        return;
                    }
                    
                    const distanceMoved = calculateDistance(
                        lastSentPositionRef.current.latitude, 
                        lastSentPositionRef.current.longitude, 
                        coords.latitude, 
                        coords.longitude
                    );

                    // Lógica de filtro: envia se o tempo OU a distância forem atingidos
                    if (now - lastSentTimeRef.current > MIN_TIME_INTERVAL_MS || distanceMoved > MIN_DISTANCE_METERS) {
                        console.log(`Enviando atualização. Motivo: ${now - lastSentTimeRef.current > MIN_TIME_INTERVAL_MS ? 'TEMPO' : 'DISTÂNCIA'}`);
                        sendPositionUpdate();
                        lastSentTimeRef.current = now;
                        lastSentPositionRef.current = coords;
                    }
                },
                (geoError) => {
                    console.error(`Erro no watchPosition: ${geoError.message}`);
                    setError(`Erro de geolocalização: ${geoError.message}`);
                    setIsUpdatingPosition(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        };

        const stopWatching = () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        };

        if (isUpdatingPosition) {
            startWatching();
        } else {
            stopWatching();
        }

        return () => { // Função de limpeza para este efeito
            stopWatching();
        };
    }, [isUpdatingPosition, sendPositionUpdate]);

    // Handlers para eventos dos componentes filhos
    const handleTripStart = (newTripId: string) => {
        setTripId(newTripId);
        fetchInitialTripData(newTripId);
        setupSocket(newTripId);
        setIsUpdatingPosition(true);
    };
    
    const handleTripEnd = () => {
        if (socketRef.current) socketRef.current.disconnect();
        // A limpeza do watch já é feita pelo useEffect quando isUpdatingPosition vira false
        
        setTripId(null);
        setLiveData(null);
        setIsUpdatingPosition(false);
        setError(null);
    };

    const handleToggleUpdate = () => {
        setIsUpdatingPosition(prev => !prev);
    };

    // O JSX para renderização permanece o mesmo
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
                        disabled={!!tripId} // Correção: deve ser desabilitado se NÃO houver tripId
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