"use client";

import dynamic from 'next/dynamic';
import React from 'react';

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

interface StopsMapProps {
    stops: Stop[];
}


const StopMap = dynamic(() => import('./StopMap'),
    { 
      ssr: false // A chave para desativar a renderização no servidor
    }
);


export const StopMapContainer = ({ stops }: StopsMapProps) => {

  return <StopMap stops={stops} />;
};

export default StopMapContainer;