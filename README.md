# Nobilis IA - Sistema de Análise Jurídica Militar

**Última atualização:** $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")

## 🚀 Deploy Status

- **Frontend**: https://nobilis-ia-46.vercel.app ✅
- **API Serverless**: Configurada para produção
- **Segurança**: Chave da API protegida no backend

## 📋 **OVERVIEW**

O NOBILIS-IA é uma plataforma completa para gestão jurídica que integra:
- 🔐 Sistema de autenticação seguro
- 👥 Gestão de usuários com diferentes roles (Admin, Advogado, Cliente)
- 📊 Dashboard com estatísticas e métricas
- 🤖 Análise de processos com IA
- 📋 Gestão de processos e pareceres
- 📚 Biblioteca de legislação
- 🔍 Sistema de auditoria completo

## 🚨 **IMPORTANTE - SEGURANÇA**

⚠️ **ESTE SISTEMA CONTÉM VULNERABILIDADES CRÍTICAS DE SEGURANÇA QUE DEVEM SER CORRIGIDAS ANTES DO DEPLOY EM PRODUÇÃO**

Consulte os arquivos:
- `security-checklist.md` - Lista completa de vulnerabilidades
- `deploy-guide.md` - Guia de deploy seguro

### Principais Riscos Identificados:
- Credenciais hardcoded no código
- Senhas em texto plano no banco
- Sistema de autenticação incompleto
- Falta de variáveis de ambiente

## 🛠️ **TECNOLOGIAS UTILIZADAS**

- **Frontend**: React 18 + TypeScript
- **UI/UX**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Build**: Vite
- **Validação**: Zod
- **Formulários**: React Hook Form

## 🚀 **DESENVOLVIMENTO**

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Git

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/nobilis-ia.git
cd nobilis-ia

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas configurações

# 4. Execute em modo desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build
npm run lint         # Verificar código
npm audit           # Verificar vulnerabilidades
```

## 🔒 **CONFIGURAÇÃO DE SEGURANÇA**

### Variáveis de Ambiente Obrigatórias

```bash
# Supabase Configuration
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon

# App Configuration
VITE_APP_NAME=NOBILIS-IA
VITE_APP_ENVIRONMENT=development

# Security
VITE_ENABLE_AUDIT_LOGS=true
VITE_SESSION_TIMEOUT=3600
VITE_MAX_LOGIN_ATTEMPTS=5
```

### Configuração do Banco de Dados

O sistema usa Supabase com as seguintes tabelas principais:
- `users` - Usuários do sistema
- `clients` - Clientes
- `processes` - Processos jurídicos
- `audit_logs` - Logs de auditoria

## 👥 **SISTEMA DE ROLES**

### Tipos de Usuário:
- **Admin**: Acesso total ao sistema
- **Lawyer**: Acesso a processos e clientes
- **Client**: Acesso limitado aos próprios processos

### Permissões:
- Row Level Security (RLS) implementado
- Auditoria de todas as ações
- Controle de acesso baseado em roles

## 📊 **FUNCIONALIDADES**

### Dashboard
- Estatísticas de processos
- Métricas de performance
- Gráficos e relatórios

### Gestão de Processos
- Cadastro de novos processos
- Análise automática com IA
- Geração de pareceres
- Controle de prazos

### Administração
- Gestão de usuários
- Configurações do sistema
- Relatórios de auditoria
- Monitoramento de segurança

## 🔐 **AUTENTICAÇÃO**

### Recursos Implementados:
- Login com email/senha
- Recuperação de senha
- Sessões persistentes
- Logout automático por inatividade
- Auditoria de login

### Validações:
- Força de senha (8+ caracteres, maiúscula, minúscula, número, especial)
- Sanitização de entrada
- Proteção contra XSS
- Validação de email

## 📈 **DEPLOY PARA PRODUÇÃO**

### Antes do Deploy:
1. **Corrigir vulnerabilidades críticas** (ver security-checklist.md)
2. **Configurar variáveis de ambiente**
3. **Configurar HTTPS**
4. **Configurar backup automático**
5. **Implementar monitoramento**

### Processo de Deploy:
```bash
# 1. Auditoria de segurança
npm audit fix

# 2. Build de produção
npm run build

# 3. Deploy (exemplo com Nginx)
sudo cp -r dist/* /var/www/nobilis-ia/
sudo systemctl restart nginx
```

## 🚨 **MONITORAMENTO E LOGS**

### Métricas Importantes:
- Uptime do sistema
- Tempo de resposta
- Erros de autenticação
- Tentativas de login falhadas
- Uso de recursos

### Logs de Auditoria:
- Todas as ações são logadas
- Retenção de 2 anos
- Logs de segurança detalhados
- Alertas automáticos

## 📞 **SUPORTE E CONTATOS**

### Documentação:
- [Security Checklist](security-checklist.md)
- [Deploy Guide](deploy-guide.md)
- [Supabase Documentation](https://supabase.com/docs)

### Contatos de Emergência:
- **Administrador do Sistema**: [email]
- **Equipe de Desenvolvimento**: [email]
- **Suporte Técnico**: [email]

## 📄 **LICENÇA**

Este projeto é propriedade privada. Todos os direitos reservados.

---

### 🔗 **Links Úteis**

- **Lovable Project**: https://lovable.dev/projects/8f378f7f-b4f0-4166-949c-e271ecd1dc0b
- **Supabase Dashboard**: https://ligcnslmsybwzcmjuoli.supabase.co
- **Documentação Técnica**: [Link para documentação]

---

**⚠️ LEMBRE-SE**: Este sistema contém vulnerabilidades críticas. NÃO faça deploy em produção sem antes corrigir todos os problemas de segurança listados no security-checklist.md!
