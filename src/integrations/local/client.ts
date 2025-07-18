// Cliente local usando localStorage
// Funciona tanto local quanto em produção

// Inicializar dados se não existirem
const initializeData = () => {
  // Inicializar usuários
  if (!localStorage.getItem('users')) {
    const initialUsers = [
      {
        id: 1,
        auth_id: '00000000-0000-0000-0000-000000000001',
        username: 'admin_crn',
        email: 'crn.nobre@gmail.com',
        role: 'admin',
        nome_completo: 'CRN Nobre - Administrador',
        matricula: 'ADM001',
        cargo_funcao: 'Administrador',
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        auth_id: '00000000-0000-0000-0000-000000000002',
        username: 'advogado',
        email: 'advogado@nobilis-ia.com',
        role: 'advogado',
        nome_completo: 'Advogado do Sistema',
        matricula: 'ADV001',
        cargo_funcao: 'Advogado',
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem('users', JSON.stringify(initialUsers));
  }

  // Inicializar processos
  if (!localStorage.getItem('processos')) {
    localStorage.setItem('processos', JSON.stringify([]));
  }
};

// Funções auxiliares
export const localDb = {
  // Buscar todos os processos
  getProcessos() {
    initializeData();
    const processos = JSON.parse(localStorage.getItem('processos') || '[]');
    return processos.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  // Buscar processo por ID
  getProcessoById(id: number) {
    initializeData();
    const processos = JSON.parse(localStorage.getItem('processos') || '[]');
    return processos.find((p: any) => p.id === id);
  },

  // Criar novo processo
  createProcesso(data: any) {
    initializeData();
    const processos = JSON.parse(localStorage.getItem('processos') || '[]');
    
    const newProcesso = {
      ...data,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    processos.push(newProcesso);
    localStorage.setItem('processos', JSON.stringify(processos));
    
    return newProcesso.id;
  },

  // Atualizar processo
  updateProcesso(id: number, data: any) {
    initializeData();
    const processos = JSON.parse(localStorage.getItem('processos') || '[]');
    
    const index = processos.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      processos[index] = {
        ...processos[index],
        ...data,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem('processos', JSON.stringify(processos));
    }
  },

  // Deletar processo
  deleteProcesso(id: number) {
    initializeData();
    const processos = JSON.parse(localStorage.getItem('processos') || '[]');
    const filteredProcessos = processos.filter((p: any) => p.id !== id);
    localStorage.setItem('processos', JSON.stringify(filteredProcessos));
  },

  // Buscar usuário por email
  getUserByEmail(email: string) {
    initializeData();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find((u: any) => u.email === email);
  },

  // Buscar usuário por auth_id
  getUserByAuthId(authId: string) {
    initializeData();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find((u: any) => u.auth_id === authId);
  },

  // Criar usuário
  createUser(data: any) {
    initializeData();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const newUser = {
      ...data,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    return newUser.id;
  },

  // Buscar processos por status
  getProcessosByStatus(status: string) {
    initializeData();
    const processos = JSON.parse(localStorage.getItem('processos') || '[]');
    return processos
      .filter((p: any) => p.status === status)
      .sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }
};

// Exportar como 'db' para manter compatibilidade
export const db = localDb; 