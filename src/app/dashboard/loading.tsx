// arquivos loading.tsx são nativos do next.js. Por padrão, eles sempre aparecem quando o next está tentando renderizar uma página
// nesse caso, como ele está diretamente em dashboard, vai aparecer para todos os elementos de dashboard quando ocorrer troca de paginas.
export default function DashboardLoading() {
  return ( 
    <div className="flex items-center justify-center h-full animate-pulse">
      <p className="text-xl text-gray-500 animate-pulse">Carregando...</p>
    </div>
  );
}