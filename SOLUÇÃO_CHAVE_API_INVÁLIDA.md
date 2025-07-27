# 🔑 Solução: Chave da API OpenAI Inválida

## ❌ Problema Identificado

A chave da API OpenAI atual está sendo rejeitada:
```
skprojEv2kxUhqVO12ffbrt5l9VcnGLu6GViYoycIG6AWTneIy5SM2Cpu4zaCOU3Qe1lm16Wd7sbkdx
```

**Erro:** `"Incorrect API key provided"`

## 📍 Local Exato para Colar a Chave

**Arquivo:** `.env.local` (na raiz do projeto)

**Localização:** `C:\Users\CRN\Documents\GitHub\nobilis-ia-46\.env.local`

**Formato atual:**
```
OPENAI_API_KEY=sk-proj-sua-chave-aqui
PORT=3002
```

## 🔧 Como Atualizar

### Opção 1: Usar o Script (Mais Fácil)
```bash
node update_api_key.cjs
```
Cole a nova chave quando solicitado.

### Opção 2: Editar Manualmente
1. **Abra o arquivo:** `.env.local`
2. **Substitua a linha:**
   ```
   OPENAI_API_KEY=sua_nova_chave_aqui
   ```
3. **Salve o arquivo**

### Opção 3: Usar PowerShell
```powershell
$novaChave = "sua_nova_chave_aqui"
$conteudo = "OPENAI_API_KEY=$novaChave`nPORT=3002"
$conteudo | Out-File -FilePath ".env.local" -Encoding UTF8
```

## ✅ Exemplo de Como Deve Ficar

```
OPENAI_API_KEY=sk-1234567890abcdef1234567890abcdef1234567890abcdef
PORT=3002
```

**Importante:** A chave deve começar com `sk-` e não ter espaços extras.

Vou criar um script simples para facilitar:

## 🧪 Testar a Nova Chave

Após atualizar, teste a chave:
```bash
node test_openai_key.cjs
```

## ✅ Verificar se Funcionou

1. **Inicie o servidor:** `node server.cjs`
2. **Teste a geração de relatório** no frontend
3. **Verifique os logs** do servidor

## 📋 Checklist

- [ ] Nova chave da API criada
- [ ] Chave atualizada no `.env.local`
- [ ] Chave testada com `test_openai_key.cjs`
- [ ] Servidor iniciado com `node server.cjs`
- [ ] Funcionalidade de IA testada no frontend

## 🆘 Se o Problema Persistir

1. **Verifique se a conta tem créditos**
2. **Verifique se a chave não expirou**
3. **Tente criar uma nova chave**
4. **Verifique se não há bloqueios na conta** 