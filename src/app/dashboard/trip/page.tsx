"use client"
// importa os estados
import { useState, useEffect, useRef, useCallback } from 'react';
// importa o socket.io para ouvir os emits do backend
import { io, Socket } from 'socket.io-client';
// importa função custom de fetch com refresh de token
import { fetchFromClient } from '@/lib/api-client';
// importa types
import { TripStatus, LiveTripData } from '@/types/trip';

// Import dinâmico para componentes client-side, isso impede que esses componentes sejam pré-renderizados no servidor, mesmo com o use cliente,
// ele tenta pré-carregar qualquer coisa que não seja useState, effect, etc, e isso pode quebrar pois o servidor é um ambiente Node.js, 
// ele não é um navegador. Isso significa que objetos e APIs que só existem no navegador, como window, document e, crucialmente, 
// navigator.geolocation, não existem no servidor.
//// Além disso, um import dinâmico (ou lazy loading) é o ato de carregar um pedaço de código (como um componente React) apenas quando ele é 
// realmente necessário, em vez de carregá-lo todo de uma vez quando a página é aberta. Isso poupa memória e alivia a carga inicial de coisas
// a serem baixadas
import dynamic from 'next/dynamic';
const StartTripPanel = dynamic(() => import('@/components/dashboard_pages/trip_page/StartTripPanel'), { ssr: false });
const ActiveTripPanel = dynamic(() => import('@/components/dashboard_pages/trip_page/ActiveTripPanel'), { ssr: false });
const MapPanel = dynamic(() => import('@/components/dashboard_pages/trip_page/MapPanel'), { ssr: false });
const InfoPanel = dynamic(() => import('@/components/dashboard_pages/trip_page/InfoPanel'), { ssr: false });

// NOVO: Função para calcular distância entre dois pontos baseado na geografia da terra(Fórmula de Haversine)
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


    // useRef são states que se mantém a cada renderização (os valor não é resetado), mas que mudar seus valores não causam uma nova renderização
    // socketRef é necessário pois é uma 'caixa' onde vão ficar armazenados os dados da conexão socket (que seriam perdidos a cada renderização, se
    // estivessem em um useState)
    const socketRef = useRef<Socket | null>(null);
    
    // nenhum dos valores abaixo vão ser usados no DOM, não é necessário causar re-renderizações quando eles mudam (mas é ncesário que se mantenham
    // a cada renderização), por isso são useRef ao invés de useStates
    const watchIdRef = useRef<number | null>(null); // guarda o ID do processo 'watchPosition', quando a função de monitorar posição é chamada 
    // em algum lugar, ela vai gerar um ID que vai ser guardado aqui
    const lastSentTimeRef = useRef<number>(0); // guarda o timestamp do último envio de posição, para enviar nova posição caso x tempo tenha passado e nenhuma tenha sido enviada
    const lastSentPositionRef = useRef<GeolocationCoordinates | null>(null); // guarda as coordenadas do último envio de posição

    // Cria uma função fetchInitialtripData, que é chamada sempre que é necessário buscar os dados inicias de uma viagem. Está em callback 
    // porque fica dentro de um useEffect (ler nota da setupSocket)
    const fetchInitialTripData = useCallback(async (currentTripId: string) => {
        try {
            const response = await fetchFromClient(`/api/trips/${currentTripId}/track`);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Falha ao buscar dados da viagem.');
            }
            const data: LiveTripData = await response.json(); // espera a resposta json do backend e salva na const data. essa const usa a 
           // interface LiveTripData   
            setLiveData(data); // chama o set do state LiveData para definir os dados da viagem.
        } catch (err) { // em caso de erro
            setError(err instanceof Error ? err.message : 'Erro ao carregar dados.'); // seta o erro, que vai ser exibido no html 
            setTripId(null); // reseta o trip id se não conseguir carregar
        }
    }, []);

    // cria uma função 'setSocket' que vai iniciar a conexão com o socket.io. O useCallback é um state de otimização do react que impede o
    // comportamento padrão do react: recriar essa função toda vez que o componente é reiniciado. O array de dependências dela [], define
    // que ela deve ser recriada toda vez que o estado de algo dentro desse array muda. Como é um array vazio, ela NUNCA vai mudar.
    // // isso é necessário em específico nessa função por causa de uma regra do react: qualquer valor (função, estado, prop) que é "puxado" 
    // de fora e usado DENTRO de um useEffect DEVE ser incluído no array de dependências dele, isso serve para impedir que o useEffect trabalhe
    // com informações 'velhas'. Até aí tudo bem, o problema é que sem o useCallback, toda vez que o componente TripPage() fosse renderizado 
    // (ex: ao atualizar o liveData), um novo setSocket seria criado, o que ia causar uma nova execução do useEffect, e isso se tornaria 
    // um loop.
    const setupSocket = useCallback((currentTripId: string) => {
        // função de limpeza, checa se já há uma conexão ativa e desconecta, para previnir conexões duplas
        if (socketRef.current) socketRef.current.disconnect();

        // realiza a conexão com o socket
        const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001');
        // armazena os detalhes da conexão no useRef
        socketRef.current = socket;

        // quando a conexão é estabelecida, roda essa função
        socket.on('connect', () => {
            console.log('Socket.IO conectado!');
            // ele emite um evento pedindo para entrar na sala com id currentTripId, foi definido no backend que ele pode fazer isso 
            // enviando a mensagem 'joinTrip' e passando um id
            socket.emit('joinTrip', currentTripId);
        });

        // agora que já entrou na sala, fica ouvindo mensagens 'positionUpdate' do socket (o socket em questão está na sala, portanto só ouve mensagens 
        // enviadas para a sala com aquele id)
        socket.on('positionUpdate', (updateData: Partial<LiveTripData>) => {
            console.log('Posição atualizada via socket:', updateData);
            // quando uma mensagem positionUpdate é emitida pelo backend, ele também emite um conjunto .json de dados, esse conjunto vai
            // pro atributo 'updateData'

            // chama o setLiveData
            setLiveData(
                prevData => { // 'prevData' => ou qualquer outro nome é o estado atual do liveData
                    if (!prevData) return updateData as LiveTripData; // se não existe, passa o updateData inteiro pro setLiveData
                    return { ...prevData, ...updateData }; // se existe, mantém os dados atuais e só substitui pelos novos que existem. 
                    // isso impede dados novos serem null quando o socket não emite algum dado (ex: salto de rotas))
                }
            );
        });
        
        // ouve a mensagem 'tripEnded' que é emitida para a sala com tripId quando a a função endTrip do backend é chamada.
        socket.on('tripEnded', (data: { message: string }) => {
            console.log('Viagem encerrada via socket:', data.message);
            alert(data.message);
            // roda a função handleTripEnd, que vai se desconectar do socket e resetar todos os useStates
            handleTripEnd();
        });

        // ao se desconectar, faz um console.log
        socket.on('disconnect', () => {
            console.log('Socket.IO desconectado.');
        });

    }, []);



    // efeito principal para verificar se o usuário tem uma viagem ativa ao carregar a página (roda só uma vez)
    useEffect(() => {

        // essa função é definida dentro desse useEffect por dois motivos: 1 - ela única e só precisa ser rodada uma vez, quando a página carrega
        // pela primeira vez. 2 - ela é dependente desse useEffect, não precisa ser usada em nenhum outro lugar, isso gera mais clareza para 
        // o código  
        const checkTripStatus = async () => {
            // define o status isLoading pra true para e roda o html da de tela de loading
            setIsLoading(true);

            try {
                const response = await fetchFromClient('/api/trips/user-status/'); // faz uma chamada para o backend que responde se há uma viagem  ativa
               
                const data: TripStatus = await response.json(); // o type TripStatus é um tipo definido para a resposta do backend TripStatus {message: string; trip_id?: string;}

                if (response.status === 200 && data.trip_id) { // se a resposta é ok e existe uma viagem ativa

                    setTripId(data.trip_id); // define o id da trip
                    await fetchInitialTripData(data.trip_id); // roda a função que seta o LiveData com os dados iniciais da trip
                    setupSocket(data.trip_id); // roda a função setup socket, que conecta na sala da trip e ativa os listeners
                } else { // se a resposta é ok, mas não existe viagem ativa
                    setTripId(null); // reseta os dados da trip
                    setLiveData(null); // reseta os dados da trip
                }
            } catch (err) { // em caso de erro, envia uma mensagem de error.
                setError(err instanceof Error ? err.message : 'Não foi possível verificar o status da viagem.');
            } finally {
                setIsLoading(false); // remove a tela de loading
            }
        };

        checkTripStatus(); // roda a função definida acima 

        // a função que um useEffect retorna é sua função de limpeza, ela é executada automaticamente quando o componente está prestes a 
        // ser "desmontado" (por exemplo, quando o usuário navega para outra página).
        return () => { // começa a limpeza
            if (socketRef.current) socketRef.current.disconnect(); // desconecta da sala
            if (watchIdRef.current) { // se existe um useRef guardando um monitorador de posição
                navigator.geolocation.clearWatch(watchIdRef.current); // interrompe o monitoramento para poupar bateria, usando o ID do watch
                // salvo na ref watchIdRef

                // watchIdRef.current = null; <- boa pratica remover o ref do ID
            }
        };

    }, [fetchInitialTripData, setupSocket]); // é uma boa pratica colocar todas as funções que são usadas no useEffect e não são definidas
    // dentro dele como dependência, para que caso as funções sejam re-renderizadas ou mudem, o useEffect use a versão mais nova delas. (caso 
    // as funções estivessem dentro do useEffect a versão mais nova estaria sempre presente, pois elas seriam criadas só quando o useEffect rodasse,
    // porém não estão, pois ambas as funções são usadas em vários outros lugares).
    // // nesse caso especifico, as funções usam o state useCallback com depêndencias vazias [], ou seja, nunca mudam, mesmo assim é uma boa 
    // prática colocá-las aqui

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

    // handleTripStart é uma função passada para a view StartTripPanel.tsx, ao usar o comando fetch de iniciar trip lá, eles também chamam 
    // handleTripStart e passando o ID da trip como parâmetro  
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