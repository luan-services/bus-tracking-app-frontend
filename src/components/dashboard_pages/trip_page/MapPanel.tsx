'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { renderToString } from 'react-dom/server';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LiveTripData } from '@/types/trip';
import {LocateFixed} from 'lucide-react'

// Corrige o problema com os ícones padrão do Leaflet no Next.js
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}

// SVG para o botão de centralizar
const centerIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 1.25rem; height: 1.25rem;"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>`;

interface MapPanelProps {
    liveData: LiveTripData | null;
}

const MapPanel: React.FC<MapPanelProps> = ({ liveData }) => {
    const mapRef = useRef<L.Map | null>(null);
    const busMarkerRef = useRef<L.Marker | null>(null);
    const rawBusMarkerRef = useRef<L.CircleMarker | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const hasZoomedRef = useRef<boolean>(false);
    
    // ALTERAÇÃO 1: O estado de "seguir" agora começa como 'false' (destravado).
    const [isFollowing, setIsFollowing] = useState(false);

    // Função para criar o ícone customizado do ônibus (com useCallback para otimização)
    const createBusIcon = useCallback(() => {
        const busIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="color: #4f46e5; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.4));"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`;
        return L.divIcon({
            html: busIconSvg,
            className: '',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
        });
    }, []);

    // Inicializa o mapa e o controle customizado
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current).setView([-23.006, -44.318], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);
            mapRef.current = map;
            
            const FollowControl = L.Control.extend({
                onAdd: function() {
                    const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom follow-button');
                    const iconHtml = renderToString(<LocateFixed strokeWidth={2.5} size={18} />);
                    button.innerHTML = iconHtml;
                    button.title = 'Centralizar e seguir o ônibus';
                    
                    L.DomEvent.disableClickPropagation(button);
                    L.DomEvent.on(button, 'click', () => {
                        // Ao clicar, ativa o modo seguir e move a câmera para o ônibus
                        setIsFollowing(prev => !prev);
                        if (!isFollowing && busMarkerRef.current) {
                           map.setView(busMarkerRef.current.getLatLng(), map.getZoom(), { animate: true });
                        }
                    });
                    
                    return button;
                }
            });

            // ALTERAÇÃO 2: Posição alterada para 'topleft' para ficar no mesmo canto do zoom.
            new FollowControl({ position: 'topleft' }).addTo(map);
            
            map.on('dragstart', () => {
                setIsFollowing(false);
            });
        }
    }, [isFollowing]); // Adicionado isFollowing aqui para que o clique tenha acesso ao estado mais recente
    
    // Atualiza a cor do botão com base no estado 'isFollowing'
    useEffect(() => {
        const button = document.querySelector('.follow-button') as HTMLElement;
        if (button) {
            button.style.backgroundColor = isFollowing ? '#e0e7ff' : '#ffffff';
            button.style.color = isFollowing ? '#4f46e5' : '#555555';
        }
    }, [isFollowing]);


    // Atualiza o mapa com os dados da viagem
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (!liveData) {
            map.eachLayer((layer) => {
                if (!(layer instanceof L.TileLayer)) {
                    map.removeLayer(layer);
                }
            });
            busMarkerRef.current = null;
            rawBusMarkerRef.current = null;
            hasZoomedRef.current = false;
            setIsFollowing(false); // Garante que a próxima viagem comece destravada
            return;
        }
        
        map.eachLayer((layer) => {
            if ((layer instanceof L.Polyline || layer instanceof L.CircleMarker) && layer !== rawBusMarkerRef.current) {
                map.removeLayer(layer);
            }
        });
        
        if (liveData.routePath?.coordinates) {
            L.geoJSON(liveData.routePath, { style: { color: '#4f46e5', weight: 5, opacity: 0.8 } }).addTo(map);
        }
        liveData.stops?.forEach(stop => {
            const isReached = liveData.stopsReached.includes(stop.name);
            L.circleMarker([stop.location.coordinates[1], stop.location.coordinates[0]], {
                radius: 6,
                color: isReached ? '#9CA3AF' : '#10B981',
                fillColor: isReached ? '#9CA3AF' : '#10B981',
                fillOpacity: 0.9,
            }).addTo(map).bindPopup(`<b>${stop.name}</b>`);
        });

        const rawLatLng: L.LatLngTuple = [liveData.rawPosition[1], liveData.rawPosition[0]];
        if (rawBusMarkerRef.current) {
            rawBusMarkerRef.current.setLatLng(rawLatLng);
        } else {
            rawBusMarkerRef.current = L.circleMarker(rawLatLng, {
                radius: 7, color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.9
            }).addTo(map).bindPopup('Posição Real (GPS)');
        }
        
        const snappedLatLng: L.LatLngTuple = [liveData.snappedPosition[1], liveData.snappedPosition[0]];
        if (busMarkerRef.current) {
            busMarkerRef.current.setLatLng(snappedLatLng);
        } else {
            busMarkerRef.current = L.marker(snappedLatLng, {
                icon: createBusIcon()
            }).addTo(map).bindPopup('Posição do Ônibus na Rota');
        }

        if (liveData.routePath?.coordinates && !hasZoomedRef.current) {
            const routeBounds = L.geoJSON(liveData.routePath).getBounds();
            map.fitBounds(routeBounds.pad(0.1));
            setTimeout(() => map.invalidateSize(true), 100);
            hasZoomedRef.current = true;
        }
        
        if (isFollowing && snappedLatLng) {
            map.setView(snappedLatLng, map.getZoom(), {
                animate: true,
                duration: 0.5
            });
        }

    }, [liveData, createBusIcon, isFollowing]);

    return (
        <div className="flex bg-white p-4 rounded-lg shadow-md h-full min-h-125 max-h-140 max-w-180">
            <div ref={mapContainerRef} className="h-[calc(100%)] w-full rounded-md"/>
        </div>
    );
};

export default MapPanel;