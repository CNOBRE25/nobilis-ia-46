# 🚀 Guia de Deploy - Vercel

**Última atualização:** $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")

## ✅ Deploy Automático

O projeto está configurado para deploy automático no Vercel. Quando você fizer push para a branch `main`, o Vercel irá automaticamente:

1. **Detectar as mudanças** no repositório
2. **Executar o build** usando `npm run build`
3. **Deployar** o frontend React
4. **Configurar** as API serverless functions

## 🔧 Configuração Manual (se necessário)

### 1. Conectar ao Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Importe o repositório `nobilis-ia-46`

### 2. Configurar Variáveis de Ambiente

No dashboard do Vercel, vá em **Settings > Environment Variables** e adicione:

```
OPENAI_API_KEY=sk-proj-...
```

### 3. Configurações do Projeto

O projeto já está configurado com:

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🌐 URLs do Deploy

- **Frontend**: https://nobilis-ia-46.vercel.app
- **API Health**: https://nobilis-ia-46.vercel.app/api/health
- **API OpenAI**: https://nobilis-ia-46.vercel.app/api/openai

## 🔄 Forçar Deploy

Para forçar um novo deploy:

1. Faça uma pequena alteração em qualquer arquivo
2. Commit e push para a branch `main`
3. O Vercel detectará automaticamente e fará o deploy

## 📋 Checklist de Deploy

- [x] Frontend configurado
- [x] API serverless criada
- [x] Variáveis de ambiente configuradas
- [x] CORS configurado
- [x] Rate limiting implementado
- [x] Documentação criada

## 🚨 Troubleshooting

Se o deploy falhar:

1. Verifique os logs no dashboard do Vercel
2. Confirme se as variáveis de ambiente estão configuradas
3. Teste localmente com `npm run build`
4. Verifique se não há erros de sintaxe 