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

Você está enfrentando um problema comum em projetos React/Vite: os imports com o prefixo `@/` não estão sendo resolvidos, resultando em erros como:

```
Error: The following dependencies are imported but could not be resolved:
  @/components/ui/toaster (imported by ...)
  @/hooks/useAuth (imported by ...)
  ...
Are they installed?
```

Esse erro geralmente ocorre porque o Vite (ou o Node) não sabe como resolver o alias `@` para o diretório `src`. Isso não é um problema de dependências "não instaladas", mas sim de configuração de alias de path.

## Como resolver

### 1. Configure o alias `@` no Vite

No seu projeto, crie ou edite o arquivo `vite.config.ts` (ou `vite.config.js`) na raiz do projeto. Adicione a configuração de alias para o diretório `src`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
```

Se o arquivo não existir, crie um novo `vite.config.ts` com esse conteúdo.

### 2. (Opcional, mas recomendado) Configure o alias no TypeScript

No seu `tsconfig.json`, adicione ou ajuste as paths para que o TypeScript também reconheça o alias:

```json
{
  "compilerOptions": {
    // ... outras opções ...
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 3. Reinicie o servidor de desenvolvimento

Após salvar as alterações, pare o servidor (`Ctrl+C` no terminal) e rode novamente:

```sh
npm run dev
```

---

**Resumo:**  
O erro não é de dependências faltando, mas sim de configuração de alias. Ajuste o `vite.config.ts` e o `tsconfig.json` conforme acima e o problema será resolvido.

Se precisar, posso criar o arquivo de configuração para você! Deseja que eu faça isso automaticamente? 

Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@vitejs/plugin-react' imported from C:\Users\CRN\Documents\GitHub\nobilis-ia-46\vite.config.ts

Isso significa que o pacote `@vitejs/plugin-react` não está instalado no seu projeto.

## Como resolver

Execute o seguinte comando no terminal, na raiz do projeto:

```sh
npm install --save-dev @vitejs/plugin-react
```

Depois disso, rode novamente:

```sh
npm run dev
```

Se precisar, posso rodar o comando para você! Deseja que eu instale automaticamente? 

## 🔒 Segurança da Chave OpenAI

- **NUNCA** coloque a chave da OpenAI em arquivos do frontend ou variáveis que começam com VITE_ (ex: VITE_OPENAI_API_KEY).
- Configure a chave **apenas** no painel de variáveis de ambiente do backend/serverless (ex: Vercel, Railway, etc).
- O frontend nunca deve acessar a OpenAI diretamente.
- Se a chave for exposta no frontend, ela pode ser roubada e usada por terceiros, gerando custos e riscos de segurança. 

---

## **PASSO 1: Crie o arquivo `.env.local` no backend**

1. **Na raiz do seu projeto** (mesmo nível do `package.json`), crie um arquivo chamado:  
   ```
   .env.local
   ```

2. **Adicione a seguinte linha** (substitua pela sua chave real da OpenAI):

   ```
   OPENAI_API_KEY=sk-proj-sua-chave-aqui
   ```

3. **Salve o arquivo**.

4. **Garanta que o arquivo `.env.local` está no `.gitignore`** (normalmente já está, mas confira para não versionar).

---

## **PASSO 2: Reinicie o backend**

- Se estiver rodando localmente, pare o servidor (`Ctrl+C`) e inicie novamente (`npm run dev` ou o comando que você usa para rodar o backend).

---

## **PASSO 3: Teste se a variável está disponível**

Vamos rodar um teste para garantir que o backend está lendo a variável corretamente.

**Posso rodar o teste para você agora?**  
Se sim, me avise e eu executo o comando para validar a configuração! 