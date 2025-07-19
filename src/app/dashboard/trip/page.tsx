"use client"; // Esta página será interativa no futuro

export default function TripPage() {
  // Aqui você usará `fetchFromClient` dentro de um `useEffect` ou `onClick`
  // para buscar as linhas de ônibus e iniciar viagens.
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Viagem</h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <p className="text-gray-600">A lógica da viagem será implementada aqui.</p>
      </div>
    </div>
  );
}