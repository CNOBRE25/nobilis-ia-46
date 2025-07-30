import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user';
import { Parecer } from '@/types/parecer';

export const usePareceres = (user: User) => {
  const [pareceres, setPareceres] = useState<Parecer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Carregar pareceres do Supabase
  const loadPareceres = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('pareceres')
        .select('*')
        .order('data_criacao', { ascending: false });

      // Filtrar por usuário se não for admin
      if (user?.role !== 'admin') {
        query = query.eq('usuario_id', user?.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar pareceres:', error);
        return;
      }

      setPareceres((data as Parecer[]) || []);
    } catch (error) {
      console.error('Erro ao carregar pareceres:', error);
    } finally {
      setLoading(false);
    }
  };

  // Salvar novo parecer
  const saveParecer = async (parecerData: Omit<Parecer, 'id' | 'data_criacao'>) => {
    try {
      const { data, error } = await supabase
        .from('pareceres')
        .insert([{
          ...parecerData,
          data_criacao: new Date().toISOString(),
          usuario_id: user?.id,
          orgao: (user as User)?.orgao // ajuste se necessário
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar parecer:', error);
        throw error;
      }

      setPareceres(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Erro ao salvar parecer:', error);
      throw error;
    }
  };

  // Atualizar parecer
  const updateParecer = async (id: string, updates: Partial<Parecer>) => {
    try {
      const { data, error } = await supabase
        .from('pareceres')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar parecer:', error);
        throw error;
      }

      setPareceres(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (error) {
      console.error('Erro ao atualizar parecer:', error);
      throw error;
    }
  };

  // Deletar parecer
  const deleteParecer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pareceres')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar parecer:', error);
        throw error;
      }

      setPareceres(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erro ao deletar parecer:', error);
      throw error;
    }
  };

  // Filtrar pareceres baseado no termo de busca e status
  const filteredPareceres = pareceres.filter(parecer => {
    const matchesSearch = searchTerm === '' || 
      parecer.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parecer.numero_protocolo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parecer.servidores?.some(servidor => 
        servidor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        servidor.matricula.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = statusFilter === 'todos' || parecer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Verificar prescrição próxima
  const isPrescricaoProxima = (dataPrescricao: string) => {
    const hoje = new Date();
    const prescricao = new Date(dataPrescricao);
    const diffTime = prescricao.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 365; // Considera próxima se faltar menos de 1 ano
  };

  // Filtrar pareceres com prescrição próxima
  const pareceresPrescricao = pareceres.filter(p => isPrescricaoProxima(p.data_prescricao));

  useEffect(() => {
    if (user) {
      loadPareceres();
    }
  }, [user]);

  return {
    pareceres,
    filteredPareceres,
    pareceresPrescricao,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    saveParecer,
    updateParecer,
    deleteParecer,
    loadPareceres,
    isPrescricaoProxima
  };
}; 