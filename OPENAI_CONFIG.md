# Configuração da OpenAI API - NOBILIS-IA

## Como Configurar a Integração ChatGPT 4o Mini

### 1. Obter API Key da OpenAI

1. Acesse [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Copie sua chave secreta (começa com `sk-...`)

### 2. Crie o arquivo de variáveis de ambiente

1. **Abra a raiz do seu projeto** (onde está o `package.json`).
2. **Crie um novo arquivo** chamado:
   ```
   .env.local
   ```
   (Se já existir, apenas edite.)

### 3. Adicione a variável da OpenAI

1. **Abra o arquivo `.env.local`**.
2. **Cole a linha abaixo**, substituindo pelo valor real da sua chave:
   ```
   VITE_OPENAI_API_KEY=sua_chave_openai_aqui
   ```
   Exemplo real:
   ```
   VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 4. Salve o arquivo

- Salve e feche o `.env.local`.

### 5. Reinicie o servidor de desenvolvimento

- Pare o servidor se estiver rodando (`Ctrl+C` no terminal).
- Rode novamente:
  ```
  npm run dev
  ```
  ou
  ```
  yarn dev
  ```

### 6. Pronto!

- Agora sua aplicação já pode acessar a chave via:
  ```js
  import.meta.env.VITE_OPENAI_API_KEY
  ```
- O sistema conseguirá se conectar à OpenAI normalmente.

### 7. Funcionalidades Implementadas

Com a API configurada, o sistema oferece:

- **Análise Jurídica Militar Automatizada**
- **Relatórios com Fundamentação Legal**
- **Tipificação Penal Específica**
- **Sugestões de Providências**
- **Download e Impressão de Relatórios**

### 8. Modo de Simulação

Se a API key não for configurada, o sistema funcionará em **modo de simulação**, gerando relatórios com dados de exemplo para demonstração.

### 9. Modelo Utilizado

- **Modelo:** GPT-4o Mini
- **Especialização:** Análise jurídica militar
- **Prompt:** Otimizado para legislação militar brasileira
- **Saída:** Estruturada em seções técnicas

### 10. Estrutura do Relatório Gerado

Cada análise jurídica contém:

1. **Descrição Sucinta** - Resumo objetivo dos fatos
2. **Fundamentação Legal** - Artigos aplicáveis (CPM, RDPM)
3. **Conclusão** - Análise jurídica detalhada
4. **Tipificação Penal** - Crimes identificados
5. **Providências Sugeridas** - Recomendações

### 11. Exemplo de Uso

1. Preencher dados do processo no formulário
2. Clicar em "Análise Jurídica IA" 
3. Aguardar processamento (5-10 segundos)
4. Visualizar relatório completo
5. Baixar/imprimir conforme necessário

### 12. Segurança

- ⚠️ **Importante**: Nunca commite a API key no repositório
- ✅ Use sempre variáveis de ambiente
- ✅ Restrinja o uso da API key ao domínio da aplicação
- ✅ Monitore o uso para evitar custos excessivos

### 13. Custos

O GPT-4o Mini é o modelo mais econômico da OpenAI:
- **Entrada**: ~$0.15 por 1M tokens
- **Saída**: ~$0.60 por 1M tokens
- **Estimativa**: ~$0.01-0.02 por relatório

### 14. Troubleshooting

**Problema**: Erro 401 - Unauthorized
**Solução**: Verificar se a API key está correta

**Problema**: Erro 429 - Rate Limit
**Solução**: Aguardar ou verificar limites da conta

**Problema**: Relatório não carrega
**Solução**: Sistema automaticamente usa modo simulação

---

**Sistema NOBILIS-IA - Análise Jurídica Inteligente** 