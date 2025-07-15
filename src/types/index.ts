// define um tipo UserProfile, que nada mais é do que um parâmetro que explica o que cada atributo do objeto UserProfile vai ser. (serve p typescript)
// At driver/page.tsx , components/driver_page/DashboardTabs.tsx, components/driver_page/ProfileTab.tsx, components/driver_page/HistoryTab.tsx
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'driver' | 'user';
}