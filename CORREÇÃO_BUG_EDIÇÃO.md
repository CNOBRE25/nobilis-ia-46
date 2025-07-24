# Correção do Bug de Edição de Processos

## 🐛 **Problema Identificado**

O sistema estava tentando criar um **novo processo** quando o usuário editava um processo existente, causando:
- Erro de chave duplicada
- Criação de registros duplicados
- Perda de dados do processo original

## ✅ **Solução Implementada**

### 1. **Detecção Automática de Modo**
- O sistema agora detecta automaticamente se está em modo de **edição** ou **criação**
- `isEditMode = !!processo` - Se há um processo passado como prop, é modo edição

### 2. **Lógica Condicional de Salvamento**

#### **MODO EDIÇÃO** (quando `processo` existe):
```javascript
// Atualizar processo existente usando ID
const { error } = await supabase.from("processos").update({
  // dados atualizados
}).eq("id", processo.id);
```

#### **MODO NOVO** (quando `processo` não existe):
```javascript
// Verificar duplicatas primeiro
const exists = await checkProcessNumberExists(form.numeroProcesso, supabase);

// Criar novo processo
const { error } = await supabase.from("processos").insert([
  // dados do novo processo
]);
```

### 3. **Fluxo de Edição Corrigido**

#### **Para Processos Existentes:**
1. **Abrir edição** → Sistema detecta `isEditMode = true`
2. **Vai direto para aba "Detalhes"** → Não precisa recriar dados básicos
3. **Salvar alterações** → Faz UPDATE usando ID do processo
4. **Gerar relatório IA** → Atualiza o processo existente

#### **Para Novos Processos:**
1. **Criar novo** → Sistema detecta `isEditMode = false`
2. **Preenche dados básicos** → Vai para aba "Dados Básicos"
3. **Salvar processo** → Faz INSERT de novo registro
4. **Completar detalhes** → Faz UPDATE dos detalhes
5. **Gerar relatório IA** → Finaliza o processo

### 4. **Campos Protegidos em Edição**

#### **Não Editáveis:**
- **Número do Processo**: Desabilitado em modo edição
- **ID do Processo**: Usado para identificação única

#### **Editáveis:**
- Todos os outros campos podem ser modificados
- Diligências, desfecho, sugestões
- Relatório IA pode ser regenerado

### 5. **Mensagens Contextuais**

#### **Títulos Dinâmicos:**
- "Novo Processo" para criação
- "Editar Processo" para edição

#### **Botões Dinâmicos:**
- "Salvar e Avançar" para novos processos
- "Atualizar e Avançar" para edição

#### **Mensagens de Sucesso:**
- "Processo cadastrado!" para novos
- "Processo atualizado!" para edição

## 🔧 **Arquivos Modificados**

### `src/components/NovoProcessoForm.tsx`
- ✅ Adicionada detecção de modo de edição
- ✅ Lógica condicional para INSERT/UPDATE
- ✅ Títulos e botões dinâmicos
- ✅ Tratamento específico para cada modo

### `src/components/ProcessBasicDataForm.tsx`
- ✅ Campo número do processo desabilitado em edição
- ✅ Placeholder contextual

## 📋 **Fluxo Completo Corrigido**

### **Criação de Novo Processo:**
1. Usuário clica "Novo Processo"
2. Sistema: `isEditMode = false`
3. Aba: "Dados Básicos"
4. Ação: INSERT novo registro
5. Próximo: Aba "Detalhes"
6. Final: Aba "Relatório IA"

### **Edição de Processo Existente:**
1. Usuário clica "Editar" em um processo
2. Sistema: `isEditMode = true`
3. Aba: "Detalhes" (pula dados básicos)
4. Ação: UPDATE registro existente
5. Próximo: Aba "Relatório IA"
6. Final: Processo atualizado

## 🎯 **Benefícios da Correção**

1. **✅ Sem duplicatas**: Não cria novos registros durante edição
2. **✅ Dados preservados**: Mantém informações originais
3. **✅ Fluxo otimizado**: Vai direto para detalhes em edição
4. **✅ Interface clara**: Títulos e botões contextuais
5. **✅ Validação correta**: Verifica duplicatas apenas para novos processos

## 🧪 **Como Testar**

### **Teste de Criação:**
1. Clique "Novo Processo"
2. Preencha dados básicos
3. Salve e verifique se foi criado

### **Teste de Edição:**
1. Clique "Editar" em um processo existente
2. Modifique algum campo
3. Salve e verifique se foi atualizado (não criado novo)

### **Teste de Relatório IA:**
1. Em modo edição, gere relatório IA
2. Verifique se atualizou o processo correto 