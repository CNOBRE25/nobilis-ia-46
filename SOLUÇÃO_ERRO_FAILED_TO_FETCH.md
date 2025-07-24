# Solução para Erro "Failed to Fetch" ao Gerar Relatório

## 🐛 **Problema Identificado**

O erro "failed to fetch" ao tentar gerar relatório indica que o frontend não consegue se comunicar com o backend da API.

## 🔍 **Possíveis Causas**

### 1. **Servidor Backend Não Está Rodando**
- O servidor `server.cjs` não foi iniciado
- O servidor parou de funcionar
- Porta 3002 está ocupada por outro processo

### 2. **Problemas de Configuração**
- Arquivo `.env.local` não existe ou está mal configurado
- Chave da API OpenAI não está configurada
- URL do backend incorreta

### 3. **Problemas de Rede**
- Firewall bloqueando a conexão
- CORS não configurado corretamente
- Problemas de DNS

### 4. **Problemas de Dependências**
- Dependências não instaladas
- Versões incompatíveis

## ✅ **Soluções Passo a Passo**

### **Passo 1: Verificar se o Servidor Está Rodando**

#### **Opção A: Usar o script de inicialização**
```bash
# No terminal, na pasta do projeto
node start_server.js
```

#### **Opção B: Iniciar manualmente**
```bash
# No terminal, na pasta do projeto
node server.cjs
```

#### **Verificar se está funcionando:**
```bash
# Testar se o servidor responde
curl http://localhost:3002
```

### **Passo 2: Verificar Configuração**

#### **Verificar arquivo .env.local:**
```bash
# Verificar se o arquivo existe
ls -la .env.local

# Verificar conteúdo (não mostrar a chave)
cat .env.local | grep -v OPENAI_API_KEY
```

#### **Estrutura correta do .env.local:**
```env
OPENAI_API_KEY=sk-...sua_chave_aqui...
PORT=3002
```

### **Passo 3: Testar Conectividade**

#### **Executar teste de conectividade:**
```bash
# No terminal, na pasta do projeto
node test_backend_connection.js
```

#### **Teste manual com curl:**
```bash
curl -X POST http://localhost:3002/api/openai/gerar-relatorio \
  -H "Content-Type: application/json" \
  -d '{
    "dadosProcesso": {
      "nome": "Teste",
      "descricao": "Teste de conectividade"
    }
  }'
```

### **Passo 4: Verificar Dependências**

#### **Instalar dependências se necessário:**
```bash
npm install express cors node-fetch dotenv express-rate-limit
```

#### **Verificar se todas as dependências estão instaladas:**
```bash
npm list express cors node-fetch dotenv express-rate-limit
```

### **Passo 5: Verificar Logs do Servidor**

#### **Iniciar servidor com logs detalhados:**
```bash
# No terminal
DEBUG=* node server.cjs
```

#### **Verificar logs no console do navegador:**
1. Abra o DevTools (F12)
2. Vá para a aba Console
3. Tente gerar relatório
4. Verifique as mensagens de erro

## 🔧 **Soluções Específicas**

### **Problema: "ECONNREFUSED"**
**Solução:**
```bash
# Verificar se a porta 3002 está livre
netstat -an | grep 3002

# Se estiver ocupada, matar o processo
lsof -ti:3002 | xargs kill -9

# Reiniciar servidor
node server.cjs
```

### **Problema: "ENOTFOUND"**
**Solução:**
- Verificar se a URL do backend está correta
- Verificar se o DNS está funcionando
- Tentar usar IP local: `http://127.0.0.1:3002`

### **Problema: "CORS Error"**
**Solução:**
- Verificar se o CORS está configurado no servidor
- Adicionar o domínio correto na configuração CORS

### **Problema: "401 Unauthorized"**
**Solução:**
- Verificar se a chave da API OpenAI está correta
- Verificar se a chave tem créditos disponíveis
- Verificar se a conta OpenAI está ativa

## 🚀 **Scripts de Diagnóstico**

### **1. Script de Teste Completo**
```bash
# Executar teste completo
node test_backend_connection.js
```

### **2. Script de Inicialização Segura**
```bash
# Iniciar servidor com verificações
node start_server.js
```

### **3. Verificar Status do Servidor**
```bash
# Verificar se o processo está rodando
ps aux | grep server.cjs

# Verificar porta
lsof -i :3002
```

## 📋 **Checklist de Verificação**

- [ ] Servidor está rodando na porta 3002
- [ ] Arquivo `.env.local` existe e está configurado
- [ ] Chave da API OpenAI está válida
- [ ] Dependências estão instaladas
- [ ] CORS está configurado corretamente
- [ ] Firewall não está bloqueando
- [ ] Logs não mostram erros críticos

## 🆘 **Se Nada Funcionar**

### **1. Reiniciar Tudo**
```bash
# Parar todos os processos
pkill -f "node server.cjs"
pkill -f "npm run dev"

# Limpar cache
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Reiniciar servidor
node server.cjs
```

### **2. Usar Modo de Desenvolvimento**
```bash
# Iniciar em modo desenvolvimento
NODE_ENV=development node server.cjs
```

### **3. Verificar Logs Detalhados**
```bash
# Logs completos
DEBUG=* NODE_ENV=development node server.cjs
```

## 📞 **Suporte**

Se o problema persistir:

1. **Coletar informações:**
   - Logs do servidor
   - Logs do navegador
   - Resultado do teste de conectividade
   - Versão do Node.js (`node --version`)

2. **Verificar ambiente:**
   - Sistema operacional
   - Versão do Node.js
   - Configuração de rede

3. **Documentar:**
   - Passos que foram tentados
   - Mensagens de erro exatas
   - Comportamento esperado vs. atual 