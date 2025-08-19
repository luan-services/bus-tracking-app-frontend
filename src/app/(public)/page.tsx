import { LineSelector } from "@/components/public_pages/home/LineSelector";
import {StopMapContainer} from "@/components/public_pages/home/StopMapContainer";

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
        <div className="space-y-12">
            {/* Seção 1: Bem-vindo e Seleção de Linha */}
            <section id="linhas" className="text-center py-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                    Bem-vindo ao BusTrack
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    Selecione uma linha de ônibus abaixo para ver os horários, a rota e acompanhar as viagens ativas em tempo real.
                </p>
                {/* O componente LineSelector continua funcionando sem alterações */}
                <LineSelector lines={lines} />
            </section>
            
            {/* Seção 2: Mapa Interativo de Paradas */}
            <section id="mapa" className="py-10">
                 {/* O componente StopsMap continua funcionando sem alterações, pois recebe os dados no formato esperado */}
                <StopMapContainer stops={stops} />
            </section>
        </div>
    );
}