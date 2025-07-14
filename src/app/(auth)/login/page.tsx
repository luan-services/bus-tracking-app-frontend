// importamos nosso formulário interativo, o Next.js entende que, embora esta página seja um Server Component, o LoginForm precisa do JavaScript no cliente.
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  // Este é um Server Component. Ele roda no servidor.
  // É rápido e pode ser gerado de forma estática (SSG).
  // Ele não pode usar useState ou outros hooks.

  return (
    <div className="flex min-h-screen w-full font-roboto items-center justify-center  bg-gray-100 ">
      {/* Aqui, o Server Component renderiza o Client Component, o HTML inicial do LoginForm será incluído na página estática, e o JavaScript necessário para torná-lo interativo será enviado para o navegador. */}
      <LoginForm />
    </div>
  );
}