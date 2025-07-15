// src/app/driver/layout.tsx

// Este é um Server Component. Roda 100% no servidor.
export default function DriverDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // A estrutura externa: fundo cinza, card branco no meio.
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Painel do Motorista</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie seu perfil e suas viagens.</p>
        </div>
        
        {/* 'children' é o buraco onde o conteúdo principal da sala (nossa page.tsx) será colocado. */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}