// src/components/Notification.tsx

// Definimos os tipos das propriedades que nosso componente vai receber.
type NotificationToastProps = {
  message: string;
  type: 'success' | 'error';
  onClick: () => void; // Uma função que será chamada quando o usuário clicar para fechar.
};

export default function NotificationToast({ message, type, onClick }: NotificationToastProps) {
  // Define a cor de fundo com base no tipo da notificação.
  const baseClasses = "p-4 pt-2 pr-2 rounded-xs flex items-start justify-between max-w-sm";
  const typeClasses = type === 'error' 
    ? 'bg-red-500 text-white' 
    : 'bg-green-500 text-white';

  return (
    // Usamos 'fixed' para que a notificação flutue sobre o conteúdo da página.
    // As classes de transição preparam o componente para animações suaves.
    <div className={`${baseClasses} ${typeClasses}`}>
      <span className="pt-2">{message}</span>
      <button  onClick={onClick} className="ml-1 rounded-full" aria-label="Fechar notificação">
        {/* Um ícone 'X' simples para fechar */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}