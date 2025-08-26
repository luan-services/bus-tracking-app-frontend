import { FeatureCard } from "@/components/main_pages/home_page/FeatureCard";
import { LineSelector } from "@/components/main_pages/home_page/LineSelector";
import {StopMapContainer} from "@/components/main_pages/home_page/StopMapContainer";
import { Users, Bus, Building } from 'lucide-react';

import heroSectionImage from "@/images/bus-hero-section.png"
import Link from "next/link";

// Tipos para os dados, eles permanecem os mesmos
interface Line {
    _id: string;
    name: string;
    lineNumber: string;
    stops: StopData[]; // Assumimos que a linha tem uma lista de paradas
}

interface StopData {
     _id: string;
    name: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
}

interface ProcessedStop {
    _id: string;
    name: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    lines: {
        _id: string;
        lineNumber: string;
        name: string;
    }[];
}


// Função para buscar as linhas e processar as paradas
async function getLinesAndProcessStops(): Promise<{ lines: Line[], stops: ProcessedStop[] }> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lines`, {
            next: { revalidate: 3600 }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch lines');
        }

        const lines: Line[] = await res.json();
        
        // Lógica para criar uma lista de paradas únicas com as linhas associadas
        const stopsMap = new Map<string, ProcessedStop>();

        for (const line of lines) {
            // Informações da linha que queremos associar à parada
            const lineInfo = {
                _id: line._id,
                name: line.name,
                lineNumber: line.lineNumber
            };

            for (const stop of line.stops) {
                // Se a parada ainda não está no nosso mapa, a adicionamos
                if (!stopsMap.has(stop.name)) {
                    // MUDANÇA 2: Usamos 'stop.name' como a chave para adicionar a nova parada.
                    stopsMap.set(stop.name, {
                        _id: stop._id, // Guardamos o ID da primeira vez que vemos essa parada
                        name: stop.name,
                        location: stop.location,
                        lines: [] 
                    });
                }
                 // Adiciona a linha atual à lista de linhas daquela parada
                stopsMap.get(stop.name)!.lines.push(lineInfo);
            }
        }

        // Converte os valores do mapa de volta para um array
        const processedStops = Array.from(stopsMap.values());
        
        return { lines, stops: processedStops };

    } catch (error) {
        console.error("Failed to fetch and process data:", error);
        return { lines: [], stops: [] };
    }
}




// O componente da página é um Server Component assíncrono
export default async function HomePage() {
    
    // Chama a nova função que busca e processa os dados
    const { lines, stops } = await getLinesAndProcessStops();

    return (
        <div className="flex flex-col w-full">

            {/* seção 1: hero section */}
            <section 
                // 1. Added 'relative' to make this the positioning container
                className="relative bg-cover bg-center bg-no-repeat" 
                style={{ backgroundImage: `url(${heroSectionImage.src})` }}
            >
                {/* 2. This is the new overlay div. It creates the fade effect. */}
                {/* You can change bg-black or opacity-50 to whatever you like. */}
                <div className="absolute inset-0 bg-white opacity-40"></div>

                {/* 3. Added 'relative' here to place the content ontop of the overlay */}
                <div className="relative justify-center md:px-40 flex min-h-144 py-8 w-full">
                    <div className="container max-h-144 flex justify-center md:justify-end items-center">
                        <div className="flex flex-col gap-6 bg-custom-light-green-2 border-b-14 border-l-14 shadow-[14px_-14px_0_0_#fffab8] border-custom-light-yellow p-8 max-w-108 min-h-98">
                            <span className="text-4xl text-center font-extrabold text-white">
                                Bem-vindo ao BuzOnd
                            </span>
                            
                            <span className="text-lg text-gray-900 max-w-2xl font-medium overflow-clip">
                                Acompanhe trajetos dos ônibus da 'nome_empresa' em tempo real com apenas um clique.
                            </span>
                            
                            <span className="text-lg text-gray-900 max-w-2xl font-medium overflow-clip">
                                Acesse o mapa interativo para acompanhar a linha desejada ou consulte informações de horários, paradas, itinerário, etc.
                            </span>
                            
                            <Link href="/map" className="flex self-center text-lg text-black bg-custom-light-yellow border-b-4 border-amber-500 py-2 px-6 rounded-lg font-medium active:scale-98 hover:scale-103 transition hover:cursor-pointer">
                                Começar
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            

            {/* seção 2: seletor de linhas */}
            <section className="w-full flex justify-center py-12 md:px-16">
                <div className="container px-2 md:px-8 py-12 gap-4 flex justify-center items-center bg-custom-light-yellow">
                    <div className="hidden md:flex flex-col gap-12 p-8 max-w-116">
                        <span className="flex font-bold text-4xl text-custom-dark-green">BUSQUE DETALHES EM TEMPO REAL SOBRE DIFERENTES FROTAS DE ÔNIBUS</span>
                        
                        <span className="flex font-bold text-4xl text-custom-dark-green">TOTALMENTE GRATUITO, SEM INCLUSÃO DE CONTEÚDO PREMIUM OU ADS</span> 
                       
                    </div>
                    
                    <LineSelector lines={lines} />

                </div>
            </section>
            
                


            {/* seção 3: mapa com paradas */}
            <section id="mapa" className="py-10">
                 {/* O componente StopsMap continua funcionando sem alterações, pois recebe os dados no formato esperado */}
                <StopMapContainer stops={stops} />
            </section>


            {/* seção 4: sobre */}
            <section className="w-full flex justify-center py-12">
                <div className="container px-2 md:px-8 py-12 gap-4 flex justify-center items-center bg-custom-light-yellow">
                    <div className="flex flex-col gap-4 p-8 items-center">
                        <span className="flex font-bold text-center text-4xl">Sobre o Sistema</span>

                        <div className="flex flex-col lg:flex-row items-center justify-center">
                            <FeatureCard
                                Icon={Users}
                                title="Visitantes"
                                description="Podem acessar informações dos ônibus para programarem suas viagens."
                            />
                            <FeatureCard 
                                Icon={Bus}
                                title="Motoristas"
                                description="Realizam viagens e enviam dados ao sistema que coleta e distribui aos visitantes."
                            />
                            <FeatureCard
                                Icon={Building}
                                title="Empresas"
                                description="Contratam o serviço para atualizar o sistema com detalhes específicos de suas linhas de ônibus."
                            />
                        </div>

                        <span className="w-full max-w-200 text-start md:text-center text-md">
                            O BuzOnd é um app de rastreamento de ônibus em tempo real, cada empresa de ônibus parceira possui um website único
                            que dispõe informações de sua própria frota. <br/><br/>
                            
                            Os motoristas iniciam viagens usando o sistema BuzOnd, enviando dados de posicionamento e alimentando uma base de dados 
                            que vai dispor dados de estimativa de tempo de chegada para cada trajeto.
                        </span>

                        <Link href="/about">
                            <span className="flex text-gray-600 hover:text-gray-900 font-medium text-md md:text-xl gap-2">
                                Para mais informações acesse: Como Funciona
                            </span>
                        </Link>
                    </div>

                </div>
            </section>
        </div>



    );
}