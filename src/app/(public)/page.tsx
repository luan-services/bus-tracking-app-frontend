import { LineSelector } from "@/components/public_pages/home/LineSelector";
import { StopsMap } from "@/components/public_pages/home/StopsMap";

// Tipos para os dados que vamos buscar
interface Line {
    _id: string;
    name: string;
    lineNumber: string;
}

interface LineInfo {
    _id: string;
    lineNumber: string;
    name: string;
}

interface Stop {
    _id: string;
    name: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    lines: LineInfo[];
}

// Funções para buscar os dados do backend
async function getLines(): Promise<Line[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lines`, {
            next: { revalidate: 3600 } // SSG com revalidação a cada 1 hora
        });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Failed to fetch lines:", error);
        return [];
    }
}

async function getStops(): Promise<Stop[]> {
     try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stops`, {
            next: { revalidate: 3600 } // SSG com revalidação a cada 1 hora
        });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Failed to fetch stops:", error);
        return [];
    }
}


// O componente da página é um Server Component assíncrono
export default async function HomePage() {
    
    // Busca os dados em paralelo para otimizar o carregamento
    const [lines, stops] = await Promise.all([
        getLines(),
        getStops()
    ]);

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
                <LineSelector lines={lines} />
            </section>
            
            {/* Seção 2: Mapa Interativo de Paradas */}
            <section id="mapa" className="py-10">
                <StopsMap stops={stops} />
            </section>
        </div>
    );
}