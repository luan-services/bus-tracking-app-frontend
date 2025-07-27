// arquivos loading.tsx são nativos do next.js. Por padrão, eles sempre aparecem quando o next está tentando renderizar uma página
// nesse caso, como ele está diretamente em dashboard, vai aparecer para todos os elementos de dashboard quando ocorrer troca de paginas.
export default function DashboardLoading() {
  return ( 
    <div className="flex w-full h-full items-center justify-center animate-pulse">
      <p className="flex text-xl text-gray-500 animate-pulse">Carregando...</p>
    </div>
  );
}