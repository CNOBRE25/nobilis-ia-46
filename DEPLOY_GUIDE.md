# 🚀 Guia de Deploy - Vercel

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
- **Node.js Version**: 18.x

## 📁 Estrutura de Deploy

```
nobilis-ia-46/
├── src/                    # Frontend React
├── api/                    # API Serverless Functions
│   └── openai.js          # Proxy para OpenAI
├── vercel.json            # Configuração do Vercel
└── package.json           # Dependências
```

## 🔐 Segurança

- ✅ Chave da API protegida no backend
- ✅ Rate limiting configurado
- ✅ CORS configurado
- ✅ Headers de segurança

## 🌐 URLs

- **Frontend**: `https://nobilis-ia-46.vercel.app`
- **API Health**: `https://nobilis-ia-46.vercel.app/api/health`
- **API OpenAI**: `https://nobilis-ia-46.vercel.app/api/openai/*`

## 🧪 Testando o Deploy

1. **Health Check**:
   ```bash
   curl https://nobilis-ia-46.vercel.app/api/health
   ```

2. **Teste da API**:
   ```bash
   curl -X POST https://nobilis-ia-46.vercel.app/api/openai/interpretar-tipificacao \
     -H "Content-Type: application/json" \
     -d '{"descricaoCrime": "Teste", "contexto": "Teste"}'
   ```

## 🔄 Atualizações

Para atualizar o deploy:

1. Faça as mudanças no código
2. Commit e push para `main`
3. O Vercel fará deploy automático

## 📊 Monitoramento

- **Logs**: Dashboard do Vercel > Functions
- **Performance**: Analytics do Vercel
- **Erros**: Function Logs no dashboard

## 🆘 Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Confirme se o Node.js version está correto

### Erro de API
- Verifique se a variável `OPENAI_API_KEY` está configurada
- Confirme se a chave da API é válida

### CORS Errors
- Verifique se o domínio está na lista de origens permitidas
- Confirme se o CORS está configurado corretamente

## 📞 Suporte

Se houver problemas:
1. Verifique os logs no dashboard do Vercel
2. Teste localmente primeiro
3. Consulte a documentação do Vercel 