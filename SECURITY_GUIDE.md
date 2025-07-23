# 🔐 Guia de Segurança - API da OpenAI

## ⚠️ Problema de Segurança

**NUNCA exponha chaves de API no frontend!** Isso é um risco grave de segurança porque:

- A chave fica visível no código fonte
- Qualquer pessoa pode ver e usar sua chave
- Não há controle de uso/rate limiting
- A chave pode ser interceptada no navegador

## ✅ Solução Segura: Backend Proxy

### Arquitetura Segura

```
Frontend (React) → Backend (Node.js) → OpenAI API
     ↑                    ↑                ↑
   Sem chave         Chave segura      API Key
```

### Vantagens da Solução

1. **Segurança**: Chave da API nunca sai do servidor
2. **Controle**: Rate limiting e validação no backend
3. **Monitoramento**: Logs de uso e auditoria
4. **Flexibilidade**: Pode adicionar cache, autenticação, etc.

## 🚀 Como Implementar

### 1. Configurar o Backend

```bash
# Instalar dependências do backend
npm install express cors dotenv express-rate-limit node-fetch

# Criar arquivo .env.server
echo "OPENAI_API_KEY=sua-chave-aqui" > .env.server
echo "PORT=3001" >> .env.server
```

### 2. Iniciar o Backend

```bash
# Terminal 1: Backend
node server.js

# Terminal 2: Frontend
npm run dev
```

### 3. Configurar Frontend

O frontend já está configurado para usar o backend. As chamadas agora vão para:
- `http://localhost:3001/api/openai/interpretar-tipificacao`
- `http://localhost:3001/api/openai/gerar-relatorio`

## 🔧 Configuração de Produção

### Variáveis de Ambiente

```bash
# .env.server (NUNCA commitar)
OPENAI_API_KEY=sk-proj-...
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://seudominio.com
```

### Deploy Seguro

1. **Backend**: Deploy em servidor privado (VPS, AWS, etc.)
2. **Frontend**: Deploy em CDN (Vercel, Netlify, etc.)
3. **CORS**: Configurar apenas domínios permitidos
4. **HTTPS**: Sempre usar HTTPS em produção

### Exemplo de Deploy

```bash
# Backend (servidor privado)
git clone seu-repo
cd nobilis-backend
npm install
echo "OPENAI_API_KEY=$OPENAI_API_KEY" > .env
npm start

# Frontend (CDN)
npm run build
# Upload para Vercel/Netlify
```

## 🛡️ Medidas de Segurança Implementadas

### 1. Rate Limiting
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP
});
```

### 2. CORS Configurado
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://seudominio.com'],
  credentials: true
}));
```

### 3. Validação de Entrada
```javascript
if (!descricaoCrime) {
  return res.status(400).json({ error: 'Descrição do crime é obrigatória' });
}
```

### 4. Tratamento de Erros
```javascript
try {
  // código da API
} catch (error) {
  console.error('Erro:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
}
```

## 📋 Checklist de Segurança

- [ ] Chave da API removida do frontend
- [ ] Backend configurado e funcionando
- [ ] Rate limiting ativo
- [ ] CORS configurado corretamente
- [ ] Variáveis de ambiente seguras
- [ ] HTTPS em produção
- [ ] Logs de auditoria ativos
- [ ] Monitoramento de uso

## 🚨 O que NÃO fazer

❌ **NUNCA** commitar chaves de API no Git
❌ **NUNCA** expor chaves no frontend
❌ **NUNCA** usar chaves em URLs públicas
❌ **NUNCA** compartilhar chaves em logs

## ✅ O que SEMPRE fazer

✅ Usar variáveis de ambiente
✅ Implementar rate limiting
✅ Validar todas as entradas
✅ Logar tentativas de acesso
✅ Monitorar uso da API
✅ Usar HTTPS em produção
✅ Manter dependências atualizadas

## 🔍 Testando a Segurança

```bash
# Testar se o backend está funcionando
curl http://localhost:3001/api/health

# Testar análise de tipificação
curl -X POST http://localhost:3001/api/openai/interpretar-tipificacao \
  -H "Content-Type: application/json" \
  -d '{"descricaoCrime": "teste"}'
```

## 📞 Suporte

Se encontrar problemas de segurança:
1. Revogue imediatamente a chave exposta
2. Gere uma nova chave
3. Atualize as variáveis de ambiente
4. Verifique os logs de acesso 

## Segurança da Chave OpenAI
- **NUNCA** coloque a chave da OpenAI em arquivos do frontend ou variáveis que começam com VITE_ (ex: VITE_OPENAI_API_KEY).
- Configure a chave **apenas** no backend/serverless (ex: painel de variáveis do Vercel, Railway, etc) como OPENAI_API_KEY.
- O frontend nunca deve acessar a OpenAI diretamente. 