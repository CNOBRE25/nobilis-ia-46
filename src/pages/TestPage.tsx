import React from 'react';
import { TestUserCreator } from '../components/TestUserCreator';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Criador de Usuário de Teste
          </h1>
          <p className="text-gray-600">
            Use esta ferramenta para criar um usuário de teste na plataforma
          </p>
        </div>
        
        <TestUserCreator />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Esta página é temporária e deve ser removida em produção</p>
        </div>
      </div>
    </div>
  );
} 