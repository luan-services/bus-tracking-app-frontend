import { FeatureCard } from "@/components/main_pages/home_page/FeatureCard";
import { LineSelector } from "@/components/main_pages/home_page/LineSelector";
import {StopMapContainer} from "@/components/main_pages/home_page/StopMapContainer";
import { Users, Bus, Building } from 'lucide-react';

import heroSectionImage from "@/images/bus-hero-section.jpg"
import Link from "next/link";

interface Line {
    _id: string;
    name: string;
    price?: string;
    lineNumber: string;
    stops: StopData[];
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

async function getLinesAndProcessStops(): Promise<{ lines: Line[], stops: ProcessedStop[] }> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lines`, {
            next: { revalidate: 3600 } // fetch com revalidate em 1 hora, para gerar um site ssg
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Falha ao buscar dados das linhas.');
        }

        const lines: Line[] = await res.json(); // recebe as linhas como json
        
        const stopsMap = new Map<string, ProcessedStop>(); // cria um map pras paradas

        for (const line of lines) {
            
            const lineInfo = { // cria um objeto line info com as informações necessárias 
                _id: line._id,
                name: line.name,
                lineNumber: line.lineNumber
            };

            for (const stop of line.stops) { // pra cada parada da linha atual
                const stopExist = stopsMap.get(stop.name); // verifica se a parada já esta no mapa, se não, retorna undefined

                if (stopExist) {
                    
                    stopExist.lines.push(lineInfo); // se já existe, adiciona a linha atual àquela parada
                } else {
                    // Se não existe, cria a parada e já adiciona a primeira linha
                    stopsMap.set(stop.name, {
                        _id: stop._id,
                        name: stop.name,
                        location: stop.location,
                        lines: [lineInfo] // Inicia o array com a linha atual
                    });
                }
            }

        }

        // Converte os valores do mapa de volta para um array
        const processedStops = Array.from(stopsMap.values());
        
        return { lines, stops: processedStops };

    } catch (err) {
        
        console.error("Failed to fetch and process data:", err instanceof Error ? err.message : 'Erro ao carregar dados.');
        return { lines: [], stops: [] };
    }
}



// server component em ssg
export default async function HomePage() {
    
    // Chama a nova função que busca e processa os dados
    const { lines, stops } = await getLinesAndProcessStops();

    return (
        <div className="flex flex-col w-full pt-2">

            {/* seção 1: hero section */}
            <section className="lg:container w-full self-center relative">
                <div className="absolute inset-0 bg-bottom-center hero-clip-path" style={ {backgroundImage: `url(${heroSectionImage.src})`}}/>
       

                <div className="relative justify-center lg:px-48 flex min-h-144 py-8 w-full">
                    <div className="container px-2 max-h-144 flex justify-center md:justify-end items-center">

                        <div className="flex flex-col max-w-108 min-h-98">
                            <span className="px-3 flex items-center justify-center text-3xl md:text-4xl text-center font-extrabold py-5 text-white bg-custom-light-green-2 rounded-t-lg">
                                Bem-vindo ao BuzOnd!
                            </span>

                            <div className="flex flex-col gap-6 w-full p-8 rounded-b-lg bg-white ">
                                <span className="md:text-lg text-gray-700 max-w-2xl font-medium overflow-clip">
                                    Acompanhe trajetos dos ônibus da 'nome_empresa' em tempo real com apenas um clique.
                                </span>
                                
                                <span className="md:text-lg text-gray-700 max-w-2xl font-medium overflow-clip">
                                    Acesse o mapa interativo para acompanhar a linha desejada ou consulte informações de horários, paradas, itinerário, etc.
                                </span>
                                
                                <Link href="/map" className="flex self-center text-lg text-gray-700 bg-custom-light-yellow border-b-4 border-amber-500 py-2 px-6 rounded-md font-medium active:scale-95 hover:scale-105 hover:cursor-pointer">
                                    Começar
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
            

            {/* seção 2: seletor de linhas */}
            <section className="w-full flex justify-center py-12 md:px-16">
                <div className="container px-2 md:px-8 py-12 gap-4 flex justify-center items-center bg-custom-light-yellow pattern-circles">
                    <div className="hidden md:flex flex-col gap-12 p-8 max-w-116">
                        <span className="flex font-bold text-4xl text-gray-700">BUSQUE DETALHES EM TEMPO REAL SOBRE DIFERENTES FROTAS DE ÔNIBUS</span>
                        
                        <span className="flex font-bold text-4xl text-gray-700">TOTALMENTE GRATUITO, SEM INCLUSÃO DE CONTEÚDO PREMIUM OU ADS</span> 
                       
                    </div>
                    
                    <LineSelector lines={lines} />

                </div>
            </section>
            
                


            {/* seção 3: mapa com paradas */}
            <section className="flex flex-col w-full justify-center items-center gap-4">

                <span className="px-2 text-3xl md:text-4xl font-bold pb-2 border-b-4 border-custom-yellow text-center">Mapa de Paradas</span>

                <span className="px-2 md:max-w-200 pb-4 md:text-lg text-center">Se preferir, econtre linhas próximas de você no mapa abaixo. <br className="md:hidden"></br><br className="md:hidden"></br> Clique nas paradas próximas para saber 
                    quais linhas passam por elas e escolha a linha para ver os detalhes dela.</span>

                <div className="md:px-8  md:py-10 w-full flex justify-center three-part-bg">
                    <StopMapContainer stops={stops} />
                </div>
            </section>


            {/* seção 4: sobre */}
            <section className="w-full flex flex-col items-center justify-center py-12">
                <span className="px-2 text-3xl md:text-4xl font-bold pb-2 border-b-4 border-custom-yellow text-center">Sobre o Site</span>
                    <div className="flex flex-col gap-4 p-8 items-center">

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

                        <span className="w-full max-w-200 text-start md:text-center text-md text-gray-700">
                            O BuzOnd é um app de rastreamento de ônibus em tempo real, cada empresa de ônibus parceira possui um website único
                            que dispõe informações de sua própria frota. <br/><br/>
                            
                            Os motoristas iniciam viagens usando o sistema BuzOnd, enviando dados de posicionamento e alimentando uma base de dados 
                            que vai dispor dados de estimativa de tempo de chegada para cada trajeto.
                        </span>

                        <Link href="/about">
                            <span className="flex w-full  text-gray-600 hover:text-gray-900 font-medium text-md md:text-xl gap-2">
                                Para mais informações acesse: Como Funciona
                            </span>
                        </Link>
                    </div>

            </section>
        </div>



    );
}