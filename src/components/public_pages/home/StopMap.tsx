'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Tipos que esperamos receber do backend
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
        coordinates: [number, number]; // [longitude, latitude]
    };
    lines: LineInfo[];
}

// Corrige o problema com os ícones padrão do Leaflet no Next.js
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}

interface StopsMapProps {
    stops: Stop[];
}

export const StopMap = ({ stops }: StopsMapProps) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            // Coordenadas centrais de Angra dos Reis
            const map = L.map(mapContainerRef.current).setView([-23.006, -44.318], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            stops.forEach(stop => {
                const marker = L.circleMarker([stop.location.coordinates[1], stop.location.coordinates[0]], {
                    radius: 6,
                    color: '#4f46e5',
                    fillColor: '#4f46e5',
                    fillOpacity: 0.9,
                }).addTo(map);

                // Cria o conteúdo do popup
                let popupContent = `<div class="font-sans"><b>${stop.name}</b><hr class="my-1">`;
                if (stop.lines.length > 0) {
                    popupContent += `<p class="text-xs text-gray-600 mb-1">Linhas que passam aqui:</p><ul class="list-none p-0 m-0">`;
                    stop.lines.forEach(line => {
                        // Usamos um ID único para cada link para poder adicionar o event listener
                        const linkId = `line-link-${line._id}-${stop._id}`;
                        popupContent += `<li><a href="/lines/${line._id}" id="${linkId}" class="text-indigo-600 hover:underline text-sm">${line.lineNumber} - ${line.name}</a></li>`;
                    });
                    popupContent += `</ul>`;
                } else {
                    popupContent += `<p class="text-sm text-gray-500">Nenhuma linha associada.</p>`;
                }
                popupContent += `</div>`;
                
                marker.bindPopup(popupContent);

                // Adiciona o evento para que o clique funcione com o Next Router
                marker.on('popupopen', () => {
                    stop.lines.forEach(line => {
                        const linkId = `line-link-${line._id}-${stop._id}`;
                        const linkElement = document.getElementById(linkId);
                        if (linkElement) {
                            linkElement.onclick = (e) => {
                                e.preventDefault();
                                router.push(`/lines/${line._id}`);
                            };
                        }
                    });
                });
            });

            mapRef.current = map;
        }
    }, [stops, router]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg w-full h-[60vh]">
             <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                Mapa de Paradas
            </h2>
            <div ref={mapContainerRef} className="h-[calc(100%-40px)] w-full rounded-md" />
        </div>
    );
};

export default StopMap;