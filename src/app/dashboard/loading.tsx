// Um loading mais genérico que será aplicado para /trip e /admin/users
export default function DashboardLoading() {
  return ( 
    <div className="flex items-center justify-center h-full animate-pulse">
      <p className="text-xl text-gray-500 animate-pulse">Carregando...</p>
    </div>
  );
}