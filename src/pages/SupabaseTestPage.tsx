import { SupabaseTest } from "@/components/SupabaseTest";

const SupabaseTestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          🔍 Teste de Configuração do Supabase
        </h1>
        <SupabaseTest />
        
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="text-blue-400 hover:text-blue-300 underline"
          >
            ← Voltar para a aplicação
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupabaseTestPage; 