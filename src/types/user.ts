export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'advogado';
  nome_completo?: string;
  matricula?: string;
  cargo_funcao?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
} 