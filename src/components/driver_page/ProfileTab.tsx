// src/components/driver_page/ProfileTab.tsx

import LogoutButton from './LogoutButton';


// importando o type criado (UserProfile)
import { UserProfile } from '@/types';

// Não precisa de "use client" porque ele só exibe dados. A interatividade está no LogoutButton.
export default function ProfileTab({ user }: { user: UserProfile }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Meu Perfil</h2>
      <div className="space-y-3">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> <span className="px-2 py-1 text-sm font-medium text-white bg-blue-600 rounded-full">{user.role}</span></p>
      </div>
      <div className="mt-8 border-t pt-6">
         <LogoutButton />
      </div>
    </div>
  );
}