import { useState, useCallback } from 'react';
import { ProcessFormData, Investigado, Vitima } from '@/types/process';
import { useForm } from '@/contexts/FormContext';
import { useProcess } from '@/contexts/ProcessContext';
import { useUI } from '@/contexts/UIContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Hook especializado para formulário de processo
export const useProcessForm = (initialData?: ProcessFormData) => {
  const { formData, setFormData, investigados, vitimas, errors, validate, clearErrors, resetForm } = useForm();
  const { createProcess, updateProcess } = useProcess();
  const { setLoading, closeModal } = useUI();
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [savedProcessId, setSavedProcessId] = useState<string | null>(null);

  // Salvar dados básicos
  const saveBasicData = useCallback(async () => {
    if (!validate()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsSaving(true);
      setLoading('form', true);

      const processData = {
        numero_processo: formData.numeroProcesso,
        tipo_processo: formData.tipoProcesso,
        prioridade: formData.prioridade,
        numero_despacho: formData.numeroDespacho,
        data_despacho: formData.dataDespacho?.toISOString().slice(0, 10) || null,
        data_recebimento: formData.dataRecebimento?.toISOString().slice(0, 10) || null,
        data_fato: formData.dataFato?.toISOString().slice(0, 10) || null,
        origem_processo: formData.origemProcesso,
        status_funcional: formData.statusFuncional,
        descricao_fatos: formData.descricaoFatos,
        tipo_crime: formData.tipoCrime,
        crimes_selecionados: formData.crimesSelecionados,
        transgressao: formData.transgressao,
        modus_operandi: formData.modusOperandi,
        nome_investigado: formData.nomeInvestigado,
        cargo_investigado: formData.cargoInvestigado,
        unidade_investigado: formData.unidadeInvestigado,
        matricula_investigado: formData.matriculaInvestigado,
        data_admissao: formData.dataAdmissao?.toISOString().slice(0, 10) || null,
        vitima: formData.vitima,
        numero_sigpad: formData.numeroSigpad,
        diligencias_realizadas: formData.diligenciasRealizadas,
        desfecho_final: formData.desfechoFinal,
        sugestoes: formData.sugestoes,
        relatorio_final: formData.relatorioFinal,
        investigados: investigados,
        vitimas: vitimas,
        status: 'tramitacao' as const
      };

      if (savedProcessId) {
        // Atualizar processo existente
        await updateProcess(savedProcessId, processData);
        toast({
          title: "Sucesso",
          description: "Dados básicos atualizados com sucesso.",
        });
      } else {
        // Criar novo processo
        const result = await createProcess(processData);
        setSavedProcessId(result.id);
        toast({
          title: "Sucesso",
          description: "Processo criado com sucesso.",
        });
      }

      return true;
    } catch (error) {
      console.error('Erro ao salvar dados básicos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados básicos.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
      setLoading('form', false);
    }
  }, [formData, investigados, vitimas, validate, savedProcessId, createProcess, updateProcess, toast, setLoading]);

  // Salvar detalhes
  const saveDetails = useCallback(async () => {
    if (!savedProcessId) {
      toast({
        title: "Erro",
        description: "Salve os dados básicos primeiro.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsSaving(true);
      setLoading('form', true);

      const detailsData = {
        descricao_fatos: formData.descricaoFatos,
        modus_operandi: formData.modusOperandi,
        diligencias_realizadas: formData.diligenciasRealizadas,
        desfecho_final: formData.desfechoFinal,
        sugestoes: formData.sugestoes
      };

      await updateProcess(savedProcessId, detailsData);
      
      toast({
        title: "Sucesso",
        description: "Detalhes salvos com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar detalhes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os detalhes.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
      setLoading('form', false);
    }
  }, [savedProcessId, formData, updateProcess, toast, setLoading]);

  // Salvar investigados e vítimas
  const saveInvestigadosVitimas = useCallback(async () => {
    if (!savedProcessId) {
      toast({
        title: "Erro",
        description: "Salve os dados básicos primeiro.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsSaving(true);
      setLoading('form', true);

      const data = {
        investigados: investigados,
        vitimas: vitimas
      };

      await updateProcess(savedProcessId, data);
      
      toast({
        title: "Sucesso",
        description: "Investigados e vítimas salvos com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar investigados e vítimas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar investigados e vítimas.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
      setLoading('form', false);
    }
  }, [savedProcessId, investigados, vitimas, updateProcess, toast, setLoading]);

  // Carregar dados para edição
  const loadForEdit = useCallback((process: any) => {
    setFormData({
      numeroProcesso: process.numero_processo || '',
      tipoProcesso: process.tipo_processo || '',
      prioridade: process.prioridade || 'media',
      numeroDespacho: process.numero_despacho || '',
      dataDespacho: process.data_despacho ? new Date(process.data_despacho) : null,
      dataRecebimento: process.data_recebimento ? new Date(process.data_recebimento) : null,
      dataFato: process.data_fato ? new Date(process.data_fato) : null,
      origemProcesso: process.origem_processo || '',
      statusFuncional: process.status_funcional || '',
      descricaoFatos: process.descricao_fatos || '',
      tipoCrime: process.tipo_crime || '',
      crimesSelecionados: process.crimes_selecionados || [],
      transgressao: process.transgressao || '',
      modusOperandi: process.modus_operandi || '',
      nomeInvestigado: process.nome_investigado || '',
      cargoInvestigado: process.cargo_investigado || '',
      unidadeInvestigado: process.unidade_investigado || '',
      matriculaInvestigado: process.matricula_investigado || '',
      dataAdmissao: process.data_admissao ? new Date(process.data_admissao) : null,
      vitima: process.vitima || '',
      numeroSigpad: process.numero_sigpad || '',
      diligenciasRealizadas: process.diligencias_realizadas || {},
      desfechoFinal: process.desfecho_final || '',
      sugestoes: process.sugestoes || '',
      relatorioFinal: process.relatorio_final || ''
    });

    setSavedProcessId(process.id);
    clearErrors();
  }, [setFormData, clearErrors]);

  // Fechar formulário
  const closeForm = useCallback(() => {
    resetForm();
    setSavedProcessId(null);
    closeModal('processForm');
  }, [resetForm, closeModal]);

  return {
    // Estado
    formData,
    investigados,
    vitimas,
    errors,
    isSaving,
    savedProcessId,
    
    // Ações
    saveBasicData,
    saveDetails,
    saveInvestigadosVitimas,
    loadForEdit,
    closeForm,
    
    // Validação
    validate,
    clearErrors
  };
}; 