// interfaces são parâmetros que explica o que cada atributo de um objeto vai ser. (no typescript)
// types são parâmetros que definem um TIPO para ser atribuído à uma função, variável, etc. Ex: string, int, são types, só que existem custom types que podem ser objetos. 
// A maior diferença é que um type pode ser um conjunto de coisas (string || int), interface é só um, um objeto (no typescript)

// Colocarei os types diretamente dentro dos componentes, já que em sua maioria, types são únicos e geralmente são dados unicos (nao sao
// objetos)

// INTERFACES SERÃO USADAS PARA OBJETOS E PROPS DE COMPONENTES, TYPES SERÃO USADOS APENAS QUANDO FOR NECESSÁRIO DEFINIR MAIS DE 2 TIPOS (COISA
// QUE A INTERFACE NÃO FAZ).

// as interfaces que ficarão aqui, são apenas as que definem objetos de bancos de dados (que provavelmente serão usadas em várias componentes)

// Interfaces para models 

// se essa interface for definido à um atributo, o atributo em questão só podera ser o objeto descrito.
// At dashboard/layout.tsx , dashboard/profile/page.tsx, dashboard/driver_page/ProfileTab.tsx, components/dashboard/DashBoardNav.tsx
export interface User {
	id?: string;
	name?: string;
	last_name?: string;
	role: 'user' | 'driver' | 'admin';
	code?: string;
	email?: string;
	cpf?: string;
};

// interface do model Stop (compõe Line)
export interface Stop {
    _id: string;
    name: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    distanceFromStart: number;
}

// interface do model RoutePath (compõe Line)
export interface RoutePath {
    type: 'LineString';
    coordinates: [number, number][];
}

// interface do model Line
// At components/dashboard_pages/trip_page/StartTripPanel.tsx
export interface Line {
    _id: string;
    lineNumber: string;
    name: string;
    stops: Stop[];
    routePath: RoutePath;
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

// interface para os dados recebidos via Socket.IO ou GET /track
// At components/dashboard_pages/trip_page/StartTripPanel.tsx components/dashboard_pages/trip_page/InfoPanel.tsx components/dashboard_pages/trip_page/MapPanel.tsx dashboard/trip/page.tsx
export interface LiveTripData {
    rawPosition: [number, number];
    snappedPosition: [number, number];
    stopETAs: { stopName: string; etaMinutes: number }[];
    routePath: RoutePath;
    stops: Stop[];
    stopsReached: string[];
    distanceTraveled: number;
    totalRouteLength: number;
};