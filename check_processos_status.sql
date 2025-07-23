-- Script para verificar o status dos processos no banco de dados
-- Execute este script no SQL Editor do Supabase

-- Verificar todos os processos
SELECT 
  id,
  numero_processo,
  status,
  created_at,
  updated_at,
  desfecho_final
FROM processos 
ORDER BY created_at DESC;

-- Contar processos por status
SELECT 
  status,
  COUNT(*) as quantidade
FROM processos 
GROUP BY status
ORDER BY quantidade DESC;

-- Verificar processos finalizados (concluído + arquivado)
SELECT 
  id,
  numero_processo,
  status,
  created_at,
  updated_at,
  desfecho_final
FROM processos 
WHERE status IN ('concluido', 'arquivado')
ORDER BY created_at DESC;

-- Verificar se há processos com status inválidos
SELECT 
  id,
  numero_processo,
  status
FROM processos 
WHERE status NOT IN ('tramitacao', 'concluido', 'arquivado', 'suspenso'); 