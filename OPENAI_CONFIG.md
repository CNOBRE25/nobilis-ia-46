<<<<<<< HEAD
# Configuração da OpenAI API - NOBILIS-IA

## Como Configurar a Integração ChatGPT 4o Mini

### 1. Obter API Key da OpenAI

1. Acesse [https://platform.openai.com/](https://platform.openai.com/)
2. Faça login ou crie uma conta
3. Vá em "API Keys" no menu lateral
4. Clique em "Create new secret key"
5. Copie a chave gerada

### 2. Configurar Variável de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com o conteúdo:

```env
VITE_OPENAI_API_KEY=sua_chave_openai_aqui
```

**Exemplo:**
```env
VITE_OPENAI_API_KEY=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
```

### 3. Funcionalidades Implementadas
=======
# Configuração da API OpenAI

## Segurança
- **NUNCA** coloque a chave da OpenAI em arquivos do frontend ou variáveis que começam com VITE_ (ex: VITE_OPENAI_API_KEY).
- Configure a chave **apenas** no backend/serverless (ex: painel de variáveis do Vercel, Railway, etc) como OPENAI_API_KEY.

## Como obter sua chave
1. Crie uma conta em https://platform.openai.com
2. Copie sua chave secreta (começa com sk-...)
3. No painel do seu provedor de backend/serverless, adicione:
   OPENAI_API_KEY=sk-proj-sua-chave-aqui

Pronto! O frontend nunca deve acessar a OpenAI diretamente.

### 7. Funcionalidades Implementadas
>>>>>>> db1e165157d7892501eb3b9d27658cd6a6100efd

Com a API configurada, o sistema oferece:

- **Análise Jurídica Militar Automatizada**
- **Relatórios com Fundamentação Legal**
- **Tipificação Penal Específica**
- **Sugestões de Providências**
- **Download e Impressão de Relatórios**

<<<<<<< HEAD
### 4. Modo de Simulação

Se a API key não for configurada, o sistema funcionará em **modo de simulação**, gerando relatórios com dados de exemplo para demonstração.

### 5. Modelo Utilizado
=======
### 8. Modo de Simulação

Se a API key não for configurada, o sistema funcionará em **modo de simulação**, gerando relatórios com dados de exemplo para demonstração.

### 9. Modelo Utilizado
>>>>>>> db1e165157d7892501eb3b9d27658cd6a6100efd

- **Modelo:** GPT-4o Mini
- **Especialização:** Análise jurídica militar
- **Prompt:** Otimizado para legislação militar brasileira
- **Saída:** Estruturada em seções técnicas

<<<<<<< HEAD
### 6. Estrutura do Relatório Gerado
=======
### 10. Estrutura do Relatório Gerado
>>>>>>> db1e165157d7892501eb3b9d27658cd6a6100efd

Cada análise jurídica contém:

1. **Descrição Sucinta** - Resumo objetivo dos fatos
2. **Fundamentação Legal** - Artigos aplicáveis (CPM, RDPM)
3. **Conclusão** - Análise jurídica detalhada
4. **Tipificação Penal** - Crimes identificados
5. **Providências Sugeridas** - Recomendações

<<<<<<< HEAD
### 7. Exemplo de Uso
=======
### 11. Exemplo de Uso
>>>>>>> db1e165157d7892501eb3b9d27658cd6a6100efd

1. Preencher dados do processo no formulário
2. Clicar em "Análise Jurídica IA" 
3. Aguardar processamento (5-10 segundos)
4. Visualizar relatório completo
5. Baixar/imprimir conforme necessário

<<<<<<< HEAD
### 8. Segurança
=======
### 12. Segurança
>>>>>>> db1e165157d7892501eb3b9d27658cd6a6100efd

- ⚠️ **Importante**: Nunca commite a API key no repositório
- ✅ Use sempre variáveis de ambiente
- ✅ Restrinja o uso da API key ao domínio da aplicação
- ✅ Monitore o uso para evitar custos excessivos

<<<<<<< HEAD
### 9. Custos
=======
### 13. Custos
>>>>>>> db1e165157d7892501eb3b9d27658cd6a6100efd

O GPT-4o Mini é o modelo mais econômico da OpenAI:
- **Entrada**: ~$0.15 por 1M tokens
- **Saída**: ~$0.60 por 1M tokens
- **Estimativa**: ~$0.01-0.02 por relatório

<<<<<<< HEAD
### 10. Troubleshooting
=======
### 14. Troubleshooting
>>>>>>> db1e165157d7892501eb3b9d27658cd6a6100efd

**Problema**: Erro 401 - Unauthorized
**Solução**: Verificar se a API key está correta

**Problema**: Erro 429 - Rate Limit
**Solução**: Aguardar ou verificar limites da conta

**Problema**: Relatório não carrega
**Solução**: Sistema automaticamente usa modo simulação

---

**Sistema NOBILIS-IA - Análise Jurídica Inteligente** 