// Esta página só é alcançável por admins, graças ao seu layout pai.
export default function ManageUsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Gerenciar Usuários
      </h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <p className="text-green-700 font-bold">Esta página só é visível para administradores.</p>
        <p>Tabela de usuários e ações de admin aqui...</p>
      </div>
    </div>
  );
}