import { LineSelector } from "@/components/main_pages/home_page/LineSelector";
import {StopMapContainer} from "@/components/main_pages/home_page/StopMapContainer";

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
                <div className="absolute inset-0 bg-green-200 opacity-20"></div>

                {/* 3. Added 'relative' here to place the content on top of the overlay */}
                <div className="relative justify-center md:px-40 flex min-h-132 w-full">
                    <div className="container flex justify-center md:justify-end items-center">
                        <div className="flex flex-col gap-6 bg-custom-light-green-2 border-b-14 border-l-14 shadow-[14px_-14px_0_0_#fff454] border-custom-yellow p-8 max-w-108 min-h-98">
                            <span className="text-4xl text-center font-extrabold text-white">
                                Bem-vindo ao BuzOnd
                            </span>
                            
                            <span className="text-lg text-gray-900 max-w-2xl font-medium">
                                Acompanhe trajetos dos ônibus da 'nome_empresa' em tempo real com apenas um clique.
                            </span>
                            
                            <span className="text-lg text-gray-900 max-w-2xl font-medium">
                                Acesse o mapa interativo para acompanhar a linha desejada ou consulte informações de horários, paradas, itinerário, etc.
                            </span>
                            
                            <Link href="/map" className="flex self-center text-lg text-black bg-custom-yellow border-b-3 border-amber-700 py-2 px-6 rounded-lg font-medium active:scale-98 hover:scale-103 transition hover:cursor-pointer">
                                Começar
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            
            
                {/* O componente LineSelector continua funcionando sem alterações */}
                <LineSelector lines={lines} />


            {/* Seção 2: Mapa Interativo de Paradas */}
            <section id="mapa" className="py-10">
                 {/* O componente StopsMap continua funcionando sem alterações, pois recebe os dados no formato esperado */}
                <StopMapContainer stops={stops} />
            </section>
        </div>
    );
}