'use client';

// NEW: Import the 'Bus' icon
import { useEffect, useRef, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LocateFixed, Bus } from 'lucide-react'; 

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

interface StopsMapProps {
    stops: Stop[];
}

// esse é um trecho de código padrão usado para consertar um problema comum quando se usa Leaflet com ferramentas de build como Webpack (usado pelo Next.js). Ele garante que os ícones de marcador padrão do Leaflet apareçam corretamente, apontando para uma URL online em vez de tentar encontrar os arquivos localmente de forma errada.
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}


export const StopMap = ({ stops }: StopsMapProps) => {

    const router = useRouter(); // router p redirecionar ao clicar nos links das paradas

    /* parte complexa: para renderizar um mapa no react, não podemos fazer isso com divs comuns e const, 
    pois qualquer re-renderização iria reiniciar esses elementos, precisamos de um componente
    que persiste entre renderizações. O useState apesar de persistir também não é uma opção aqui, pois
    não precisamos alternar nada no objeto, apenas precisamos guardar uma referência à ele, mudar coisas
    no mapa poderia causar re-renderizações e bugá-lo caso fosse salvo em um useState, as mudanças no
    mapa são feitas diretamente pelas funções do leaflet.
    
    então qual é a melhor opção? o useRef, que é como uma caixinha, feito para guardar referencias à 
    elementos, valores, instancias, que não vão ser perdidos à cada nova renderização e que NÃO CAUSAM 
    re-renderizações se seus valores são mudados.*/

    /* precisamos de básicamentes dois refs: um que vai guardar uma div qualquer que vai ser o espaço onde
    o mapa vai ser colocado, e um que vai guardar a instância do mapa (um objeto mapa) própriamente dito
    
    mapRef guardará a instancia do mapa criado
    mapContainerRef guardara o 'endereço' da div onde o mapa vai ser 'desenhado'    */
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    
    // useState para o botão de travar tela (true ou false) no usuário
    const [isFollowingUser, setIsFollowingUser] = useState(false);

    // useState para definir a posição lat lng do usuário
    const [userLocation, setUserLocation] = useState<L.LatLng | null>(null); 
    
    // também é necessário criar refs para a posição do usuário no mapa, já que é uma posição que vai estar
    // constantemente mudando (não é fixa igual as paradas pré-carregadas.)
    const userMarkerRef = useRef<L.CircleMarker | null>(null); // ref para a bolinha do usuário
    // useState para direção que ele está olhando
    const [userHeading, setUserHeading] = useState<number | null>(null); 
    const headingConeRef = useRef<L.Polygon | null>(null); // ref para o 'cone'

    
    useEffect(() => { // esse primeiro useEffect serve para pegar a posição atual do usuário e dispor no mapa
        
        if (typeof window !== 'undefined' && 'geolocation' in navigator) { // verifica se o navegador suporta geolocalização
            
            const watcher = navigator.geolocation.watchPosition((position) => { // inicia o watchposition, a cada atualização de posição essa função vai rodar
                    const { latitude, longitude, heading } = position.coords;
                    const newLatLng = new L.LatLng(latitude, longitude);
                    
                    setUserLocation(newLatLng); // seta o state da localização
                    
                    
                    if (typeof heading === 'number' && !isNaN(heading)) { // se a posição que o usuário está apontando é valida, seta também
                        setUserHeading(heading);
                    } else {
                        setUserHeading(null);
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error.message);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0,}
            );

            return () => { // função de limpeza, remove o watchPosition quando sai da página
                navigator.geolocation.clearWatch(watcher);
            };
        }

    }, []); // não tem nenhuma dependência, o useEffect nunca será reiniciado

    
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current, { scrollWheelZoom: false }).setView([-23.006, -44.318], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);
            
            mapRef.current = map;
            
            // --- Bus Stop Markers with Icons ---
            const busIconHtml = renderToString(<Bus size={18} color="#4f46e5" />);
            const busIcon = L.divIcon({
                html: `<div class="bg-white rounded-full p-1 shadow-md">${busIconHtml}</div>`,
                className: '',
                iconSize: [26, 26],
                iconAnchor: [13, 13],
            });

            stops.forEach(stop => {
                const marker = L.marker([stop.location.coordinates[1], stop.location.coordinates[0]], {
                    icon: busIcon
                }).addTo(map);

                let popupContent = `<div class="font-sans"><b>${stop.name}</b><hr class="my-1">`;
                if (stop.lines.length > 0) {
                    popupContent += `<p class="text-xs text-gray-600 mb-1">Linhas que passam aqui:</p><ul class="list-none p-0 m-0">`;
                    stop.lines.forEach(line => {
                        const linkId = `line-link-${line._id}-${stop._id}`;
                        popupContent += `<li><a href="/lines/${line._id}" id="${linkId}" class="text-indigo-600 hover:underline text-sm">${line.lineNumber} - ${line.name}</a></li>`;
                    });
                    popupContent += `</ul>`;
                } else {
                    popupContent += `<p class="text-sm text-gray-500">Nenhuma linha associada.</p>`;
                }
                popupContent += `</div>`;
                
                marker.bindPopup(popupContent);

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

            // Custom control to follow user's location
            const FollowUserControl = L.Control.extend({
                onAdd: function() {
                    const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom follow-user-button');
                    const iconHtml = renderToString(<LocateFixed strokeWidth={2.5} size={15} />);
                    button.innerHTML = iconHtml;
                    button.title = 'Centralizar na sua localização';
                    
                    L.DomEvent.disableClickPropagation(button);
                    L.DomEvent.on(button, 'click', () => {
                        setIsFollowingUser(prev => !prev);
                        if (!isFollowingUser && userLocation) {
                           map.setView(userLocation, 16, { animate: true });
                        }
                    });
                    
                    return button;
                }
            });

            new FollowUserControl({ position: 'topleft' }).addTo(map);

            map.on('dragstart', () => {
                setIsFollowingUser(false);
            });
        }
    }, [stops, router, isFollowingUser, userLocation]);

    // Effect to update the follow button's style based on state (no changes)
    useEffect(() => {
        const button = document.querySelector('.follow-user-button') as HTMLElement;
        if (button) {
            button.style.backgroundColor = isFollowingUser ? '#e0e7ff' : '#ffffff';
            button.style.color = isFollowingUser ? '#4338ca' : '#555555';
        }
    }, [isFollowingUser]);

    // MODIFIED: Effect to draw user marker AND heading cone
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !userLocation) return;

        // --- User Marker Logic ---
        if (!userMarkerRef.current) {
            userMarkerRef.current = L.circleMarker(userLocation, {
                radius: 8,
                color: '#ffffff',
                weight: 2,
                fillColor: '#3b82f6',
                fillOpacity: 1,
            }).addTo(map);
        } else {
            userMarkerRef.current.setLatLng(userLocation);
        }

        // --- Heading Cone Logic ---
        if (userHeading !== null) {
            const angle = 20; // Spread of the cone in degrees
            const coneLength = 0.0003; // Adjust this value for a larger/smaller cone
            
            // Convert leaflet's LatLng to a standard object for calculations
            const centerPoint = { lat: userLocation.lat, lng: userLocation.lng };

            // Calculate the two outer points of the cone in degrees
            const p1 = {
                lat: centerPoint.lat + coneLength * Math.cos((userHeading - angle) * Math.PI / 180),
                lng: centerPoint.lng + coneLength * Math.sin((userHeading - angle) * Math.PI / 180)
            };
            const p2 = {
                lat: centerPoint.lat + coneLength * Math.cos((userHeading + angle) * Math.PI / 180),
                lng: centerPoint.lng + coneLength * Math.sin((userHeading + angle) * Math.PI / 180)
            };

            const coneLatLngs: L.LatLngExpression[] = [
                [centerPoint.lat, centerPoint.lng],
                [p1.lat, p1.lng],
                [p2.lat, p2.lng]
            ];

            // Create or update the cone polygon
            if (!headingConeRef.current) {
                headingConeRef.current = L.polygon(coneLatLngs, {
                    color: '#60a5fa', // A lighter blue
                    fillColor: '#60a5fa',
                    fillOpacity: 0.5,
                    weight: 1,
                }).addTo(map);
            } else {
                headingConeRef.current.setLatLngs(coneLatLngs);
            }
        } else if (headingConeRef.current) {
            // If heading becomes null (e.g., user stops), remove the cone
            map.removeLayer(headingConeRef.current);
            headingConeRef.current = null;
        }

        // --- Following Logic ---
        if (isFollowingUser) {
            map.setView(userLocation, map.getZoom() < 15 ? 16 : map.getZoom(), {
                animate: true,
                duration: 0.5 
            });
        }
    }, [userLocation, isFollowingUser, userHeading]);


    return (
        <div className="flex md:border-1 md:border-gray-300 md:bg-white p-1 rounded-xs md:shadow-md w-full max-w-296 h-[calc(70vh)] md:h-140">
            <div ref={mapContainerRef} className="h-[calc(100%)] w-full"/>
        </div>
    );
};