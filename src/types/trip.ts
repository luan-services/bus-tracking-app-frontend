// src/types/trip.ts

// Tipagem para uma parada de ônibus
export interface Stop {
    _id: string;
    name: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    distanceFromStart: number;
}

// Tipagem para a rota da linha
export interface RoutePath {
    type: 'LineString';
    coordinates: [number, number][];
}

// Tipagem para uma linha de ônibus
export interface Line {
    _id: string;
    lineNumber: string;
    name: string;
    stops: Stop[];
    routePath: RoutePath;
}

// Tipagem para o status da viagem retornado pela API (backend) que retorna { message: "Usuário possui uma trip ativa", trip_id: existingTrip.id } 
// ou { message: "Usuário não possui trip ativa" }
// At @/app/dashboard/trip/page.tsx
export interface TripStatus {
    message: string;
    trip_id?: string;
}

// Tipagem para os dados de uma viagem ativa
export interface Trip {
    _id: string;
    driver: string;
    line: Line;
    startTime: string;
    isActive: boolean;
    currentPosition: {
        type: 'Point';
        coordinates: [number, number];
        updatedAt: string;
    };
    distanceTraveled: number;
    stopsReached: { stopName: string; timestamp: string }[];
    stopETAs: { stopName: string; etaMinutes: number }[];
}

// Tipagem para os dados recebidos via Socket.IO ou GET /track
export interface LiveTripData {
    rawPosition: [number, number];
    snappedPosition: [number, number];
    stopETAs: { stopName: string; etaMinutes: number }[];
    routePath: RoutePath;
    stops: Stop[];
    stopsReached: string[];
    distanceTraveled: number;
    totalRouteLength: number;
}