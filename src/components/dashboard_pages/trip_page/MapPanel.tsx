// src/components/dashboard_pages/trip_page/MapPanel.tsx
'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LiveTripData } from '@/types/trip';

// Corrige o problema com os ícones padrão do Leaflet no Next.js
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}


interface MapPanelProps {
    liveData: LiveTripData | null;
}

const MapPanel: React.FC<MapPanelProps> = ({ liveData }) => {
    const mapRef = useRef<L.Map | null>(null);
    const busMarkerRef = useRef<L.Marker | null>(null);
    const rawBusMarkerRef = useRef<L.CircleMarker | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const hasZoomedRef = useRef<boolean>(false); // <-- ref de flag para impedir o zoom de ocorrer à cada atualização

    // Função para criar o ícone customizado do ônibus
    const createBusIcon = () => {
        const busIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="color: #4f46e5; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.4));"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`;
        return L.divIcon({
            html: busIconSvg,
            className: '',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
        });
    };

    // Inicializa o mapa
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView([-23.006, -44.318], 13); // Coordenadas de Angra dos Reis
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapRef.current);
        }
    }, []);

    // Atualiza o mapa com os dados da viagem
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Se a viagem terminou (liveData é null), executa a limpeza completa.
        if (!liveData) {
            // Itera por todas as camadas presentes no mapa.
            map.eachLayer((layer) => {
                // A condição verifica se a camada NÃO é o mapa de fundo (TileLayer).
                // Isso garante que removeremos rotas, marcadores, círculos, etc.
                if (!(layer instanceof L.TileLayer)) {
                    map.removeLayer(layer);
                }
            });

            // Zera as referências para garantir que os marcadores sejam recriados na próxima viagem.
            busMarkerRef.current = null;
            rawBusMarkerRef.current = null;
            hasZoomedRef.current = false; // <-- Redefine a flag de zoom para a próxima viagem

            // Encerra a execução aqui, deixando o mapa limpo.
            return;
        }

        // SE HOUVER UMA VIAGEM ATIVA, O CÓDIGO ABAIXO É EXECUTADO NORMALMENTE

        // Limpa apenas as camadas que precisam ser redesenhadas (rota e paradas)
        map.eachLayer((layer) => {
            if ((layer instanceof L.Polyline || layer instanceof L.CircleMarker) && layer !== rawBusMarkerRef.current) {
                map.removeLayer(layer);
            }
        });

        // Desenha a rota
        if (liveData.routePath?.coordinates) {
            L.geoJSON(liveData.routePath, { style: { color: '#4f46e5', weight: 5, opacity: 0.8 } }).addTo(map);
        }

        // Desenha as paradas
        liveData.stops?.forEach(stop => {
            const isReached = liveData.stopsReached.includes(stop.name);
            L.circleMarker([stop.location.coordinates[1], stop.location.coordinates[0]], {
                radius: 6,
                color: isReached ? '#9CA3AF' : '#10B981',
                fillColor: isReached ? '#9CA3AF' : '#10B981',
                fillOpacity: 0.9,
            }).addTo(map).bindPopup(`<b>${stop.name}</b>`);
        });

        // Posição real (GPS)
        const rawLatLng: L.LatLngTuple = [liveData.rawPosition[1], liveData.rawPosition[0]];
        if (rawBusMarkerRef.current) {
            rawBusMarkerRef.current.setLatLng(rawLatLng);
        } else {
            rawBusMarkerRef.current = L.circleMarker(rawLatLng, {
                radius: 7, color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.9
            }).addTo(map).bindPopup('Posição Real (GPS)');
        }

        // Posição na rota (snapped)
        const snappedLatLng: L.LatLngTuple = [liveData.snappedPosition[1], liveData.snappedPosition[0]];
        if (busMarkerRef.current) {
            busMarkerRef.current.setLatLng(snappedLatLng);
        } else {
            busMarkerRef.current = L.marker(snappedLatLng, {
                icon: createBusIcon()
            }).addTo(map).bindPopup('Posição do Ônibus na Rota');
        }

        // Ajusta o zoom e força a invalidação
        if (liveData.routePath?.coordinates && !hasZoomedRef.current) {
            const routeBounds = L.geoJSON(liveData.routePath).getBounds();
            map.fitBounds(routeBounds.pad(0.1));
            setTimeout(() => {
                map.invalidateSize(true);
            }, 100);

            // Define a flag para true para não executar o zoom novamente.
            hasZoomedRef.current = true;
        }

    }, [liveData, createBusIcon]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-md h-full min-h-[500px]">
            {/* container do mapa precisa sempre estar no DOM, pois o mapa leaftlet só funciona assim */}
            <div ref={mapContainerRef} className="h-[calc(100%-40px)] w-full rounded-md"/>
        </div>
    );
};

export default MapPanel;