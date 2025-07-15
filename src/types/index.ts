// define um tipo UserProfile, que nada mais é do que um parâmetro que explica o que cada atributo do objeto UserProfile vai ser. (serve p typescript)
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'driver' | 'user';
}