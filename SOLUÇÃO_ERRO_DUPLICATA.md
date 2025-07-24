# Solução para Erro de Chave Duplicada - Número do Processo

## Problema
O erro `duplicate key value violates unique constraint processos numero processo key` indica que você está tentando inserir um processo com um número que já existe na tabela.

## Causas Possíveis
1. **Números duplicados já existem no banco**: Pode haver processos com o mesmo número
2. **Falta de validação no frontend**: O sistema não verifica se o número já existe antes de tentar inserir
3. **Constraint UNIQUE não está funcionando corretamente**: A constraint pode estar faltando ou corrompida

## Soluções

### 1. Correção Imediata (Execute no SQL Editor do Supabase)

Execute o script `quick_fix_duplicate_process.sql` que foi criado. Este script irá:
- Verificar se há números duplicados
- Corrigir automaticamente os duplicados existentes
- Garantir que a constraint UNIQUE existe

### 2. Melhorias no Frontend (Já implementadas)

As seguintes melhorias foram adicionadas ao código:

#### a) Campo livre para números
- Campo de texto livre para digitar qualquer número
- Verificação de duplicatas antes da inserção
- Sem restrições de formato

#### b) Validação de duplicatas
- Verifica se o número já existe antes de tentar inserir
- Mostra mensagens de erro específicas
- Campo livre para qualquer formato de número

#### c) Tratamento de erros específico
- Identifica erros de chave duplicada
- Fornece mensagens claras ao usuário
- Sugere soluções (gerar novo número)

### 3. Como Usar as Novas Funcionalidades

#### Para cadastrar um novo processo:
1. Digite qualquer número de processo no campo "Número do Processo"
2. O sistema verificará automaticamente se o número já existe
3. Se o número for único, o processo será cadastrado
4. Se o número já existir, você receberá uma mensagem de erro

#### Exemplos de números aceitos:
- `001/2025`
- `IP-2025-001`
- `PROC-12345`
- `2025/001`
- Qualquer formato que você preferir

### 4. Verificação Manual

Se quiser verificar manualmente se há duplicatas:

```sql
-- Verificar duplicatas
SELECT 
    numero_processo,
    COUNT(*) as quantidade
FROM public.processos 
GROUP BY numero_processo 
HAVING COUNT(*) > 1
ORDER BY quantidade DESC;

-- Verificar todos os números
SELECT 
    numero_processo,
    created_at,
    status
FROM public.processos 
ORDER BY numero_processo;
```

### 5. Prevenção Futura

Para evitar problemas futuros:

1. **Digite qualquer número** que preferir
2. **Não reutilize números** de processos existentes
3. **O sistema verificará automaticamente** se o número já existe
4. **Use números únicos** para cada processo

### 6. Scripts Disponíveis

- `quick_fix_duplicate_process.sql`: Correção rápida de duplicatas
- `fix_duplicate_process_number.sql`: Script completo com funções
- `src/utils/processNumberGenerator.ts`: Utilitários JavaScript

### 7. Estrutura da Tabela

A tabela `processos` deve ter:
```sql
numero_processo VARCHAR(255) NOT NULL UNIQUE
```

Se a constraint UNIQUE não existir, execute:
```sql
ALTER TABLE public.processos ADD CONSTRAINT uk_processos_numero UNIQUE (numero_processo);
```

## Contato

Se o problema persistir após aplicar estas soluções, verifique:
1. Se o script SQL foi executado com sucesso
2. Se não há erros no console do navegador
3. Se a constraint UNIQUE está ativa na tabela 