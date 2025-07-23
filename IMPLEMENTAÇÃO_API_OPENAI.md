# Implementação da API OpenAI - NOBILIS-IA

## 🚀 Configuração Completa da API ChatGPT 4o Mini

### 1. Obter Chave da API OpenAI

1. **Acesse**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **Faça login** na sua conta OpenAI
3. **Clique em "Create new secret key"**
4. **Copie a chave** (começa com `sk-proj-...`)
5. **Guarde a chave** em local seguro

### 2. Configurar Variáveis de Ambiente

1. **Na raiz do projeto**, crie o arquivo `.env.local`:
   ```bash
   # Windows
   copy env.local.example .env.local
   
   # Linux/Mac
   cp env.local.example .env.local
   ```

2. **Edite o arquivo `.env.local`** e substitua:
   ```env
   VITE_OPENAI_API_KEY=sk-proj-sua_chave_real_aqui
   ```

### 3. Testar a Configuração

1. **Execute o script de teste**:
   ```bash
   node test_openai_api.js
   ```

2. **Verifique se aparece**:
   ```
   ✅ API funcionando corretamente!
   📊 Modelo usado: gpt-4o-mini
   ```

### 4. Aplicar Migração do Banco

1. **Acesse o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Execute o script** `apply_relatorio_final_migration.sql`

### 5. Funcionalidades Implementadas

#### ✅ Geração Automática de Relatório Final
- **Quando**: Processo é finalizado
- **Onde**: `NovoProcessoForm.tsx` → `handleSaveAndConclude()`
- **O que**: Gera relatório completo com IA
- **Salva**: No banco de dados (campo `relatorio_final`)

#### ✅ Visualização do Relatório
- **Onde**: `ProcessList.tsx` → Modal de consulta
- **O que**: Exibe relatório completo com formatação
- **Inclui**: Todas as seções do relatório oficial

#### ✅ Modo de Simulação
- **Quando**: API não configurada
- **O que**: Gera relatório de exemplo
- **Para**: Demonstração e desenvolvimento

### 6. Estrutura do Relatório Gerado

```
## CABECALHO
RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR
[SIGPAD, Despacho, Datas, etc.]

## I – DAS PRELIMINARES
[Análise inicial e tipificação]

## II – DOS FATOS
[Descrição detalhada dos fatos]

## III – DAS DILIGÊNCIAS
[Diligências realizadas e documentos]

## IV – DA FUNDAMENTAÇÃO
[Análise jurídica e legal]

## V – DA CONCLUSÃO
[Conclusão e encaminhamentos]
```

### 7. Como Usar

#### Finalizar Processo com Relatório
1. **Preencha** todos os dados do processo
2. **Selecione** o desfecho final
3. **Clique** em "Finalizar Processo"
4. **Aguarde** a geração do relatório (5-10 segundos)
5. **Confirme** o sucesso

#### Consultar Relatório Finalizado
1. **Acesse** "Processos Finalizados"
2. **Clique** em "Consultar"
3. **Visualize** o relatório completo
4. **Veja** todas as seções formatadas

### 8. Troubleshooting

#### ❌ Erro: "API Key não configurada"
**Solução**:
```bash
# Verifique se o arquivo .env.local existe
ls -la .env.local

# Verifique se a chave está correta
cat .env.local | grep VITE_OPENAI_API_KEY
```

#### ❌ Erro: "401 Unauthorized"
**Solução**:
- Verifique se a chave API está correta
- Confirme se a chave tem créditos disponíveis
- Verifique se a conta OpenAI está ativa

#### ❌ Erro: "429 Rate Limit"
**Solução**:
- Aguarde alguns minutos
- Verifique os limites da sua conta OpenAI
- Considere upgrade do plano se necessário

#### ❌ Relatório não aparece
**Solução**:
- Verifique se a migração foi aplicada
- Confirme se o processo foi finalizado
- Verifique os logs do console

### 9. Custos e Limites

#### 💰 Custos Estimados
- **GPT-4o Mini**: ~$0.01-0.02 por relatório
- **Tokens por relatório**: ~800-1200 tokens
- **Custo mensal** (100 relatórios): ~$1-2

#### 📊 Limites
- **Rate Limit**: 3 requests por minuto (gratuito)
- **Tokens máximos**: 128K por request
- **Tempo de resposta**: 5-15 segundos

### 10. Segurança

#### 🔒 Boas Práticas
- ✅ Nunca commite a API key no git
- ✅ Use sempre variáveis de ambiente
- ✅ Restrinja o uso ao domínio da aplicação
- ✅ Monitore o uso para evitar custos excessivos

#### 🚨 Importante
- A chave API é secreta e não deve ser compartilhada
- Mantenha o arquivo `.env.local` no `.gitignore`
- Revogue chaves antigas regularmente

### 11. Monitoramento

#### 📈 Logs de Uso
- Console do navegador mostra erros
- Supabase logs mostram operações
- OpenAI dashboard mostra uso da API

#### 🔍 Debug
```javascript
// No console do navegador
console.log('OpenAI Key configurada:', !!import.meta.env.VITE_OPENAI_API_KEY);
```

### 12. Próximos Passos

#### 🎯 Melhorias Futuras
- [ ] Cache de relatórios para economizar tokens
- [ ] Templates personalizáveis
- [ ] Análise de múltiplos processos
- [ ] Exportação em PDF
- [ ] Integração com outros modelos de IA

---

## ✅ Checklist de Implementação

- [ ] Obter chave API OpenAI
- [ ] Criar arquivo `.env.local`
- [ ] Testar API com script
- [ ] Aplicar migração do banco
- [ ] Finalizar processo com relatório
- [ ] Consultar relatório finalizado
- [ ] Verificar logs e erros
- [ ] Configurar monitoramento

---

**Sistema NOBILIS-IA - Análise Jurídica Inteligente** 🚀 