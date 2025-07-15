# 🚀 NOBILIS-IA - Guia de Deploy para Produção

## 📋 **PRÉ-REQUISITOS**

### Ambiente de Desenvolvimento
- Node.js 18+ instalado
- npm ou yarn
- Git configurado
- Acesso ao Supabase

### Ambiente de Produção
- Servidor web (Nginx/Apache)
- SSL/TLS configurado
- Domínio configurado
- CDN configurado (recomendado)

## 🔧 **CONFIGURAÇÃO INICIAL**

### 1. Variáveis de Ambiente
Crie um arquivo `.env.production` com as seguintes variáveis:

```bash
# Supabase (Produção)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_producao

# App Configuration
VITE_APP_NAME=NOBILIS-IA
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production

# Security
VITE_ENABLE_AUDIT_LOGS=true
VITE_SESSION_TIMEOUT=1800
VITE_MAX_LOGIN_ATTEMPTS=3

# Features
VITE_ENABLE_REGISTRATION=false
VITE_ENABLE_PASSWORD_RESET=true
```

### 2. Banco de Dados de Produção

#### Configurar Supabase para Produção:
```sql
-- 1. Remover dados de teste
DELETE FROM public.users WHERE email IN ('admin@nobilis-ia.com', 'advogado@nobilis-ia.com');

-- 2. Criar usuário admin real
INSERT INTO public.users (auth_id, username, email, role, nome_completo, ativo)
VALUES (
  'uuid-do-admin-real',
  'admin',
  'admin@seudominio.com',
  'admin',
  'Administrador do Sistema',
  true
);

-- 3. Remover função insegura
DROP FUNCTION IF EXISTS public.verify_user_credentials(TEXT, TEXT);

-- 4. Configurar políticas de segurança
-- Ver arquivo: database-security.sql
```

### 3. Configuração do Servidor Web

#### Nginx (Recomendado):
```nginx
server {
    listen 443 ssl http2;
    server_name seudominio.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://seu-projeto.supabase.co" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Root directory
    root /var/www/nobilis-ia/dist;
    index index.html;
    
    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security: Block access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~* \.(env|config|sql)$ {
        deny all;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name seudominio.com;
    return 301 https://$server_name$request_uri;
}
```

## 📦 **PROCESSO DE BUILD**

### 1. Instalação de Dependências
```bash
cd nobilis-ia-46
npm ci --production
```

### 2. Auditoria de Segurança
```bash
npm audit fix
npm audit --audit-level=high
```

### 3. Build para Produção
```bash
npm run build
```

### 4. Testes Pré-Deploy
```bash
npm run preview
# Teste todas as funcionalidades principais
```

## 🔍 **CHECKLIST DE SEGURANÇA**

### Antes do Deploy
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Senhas hardcoded removidas
- [ ] Usuários de teste removidos
- [ ] SSL/TLS configurado
- [ ] Headers de segurança configurados
- [ ] Backup do banco configurado
- [ ] Monitoramento básico ativo

### Após o Deploy
- [ ] Teste de login funcional
- [ ] Teste de roles e permissões
- [ ] Teste de auditoria funcionando
- [ ] Verificação de logs de erro
- [ ] Teste de performance básico
- [ ] Verificação de SSL/TLS
- [ ] Teste de security headers

## 🚨 **MONITORAMENTO**

### Métricas Essenciais
- Uptime do sistema
- Tempo de resposta
- Erros de autenticação
- Tentativas de login falhadas
- Uso de recursos do banco

### Alertas Críticos
- Sistema fora do ar
- Múltiplas tentativas de login falhadas
- Erros de banco de dados
- Uso excessivo de recursos
- Tentativas de acesso não autorizado

## 📊 **CONFIGURAÇÃO DE LOGS**

### Supabase Logs
```sql
-- Configurar retenção de logs
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS retention_date TIMESTAMP WITH TIME ZONE 
DEFAULT (NOW() + INTERVAL '2 years');

-- Criar job de limpeza (se suportado)
CREATE OR REPLACE FUNCTION cleanup_audit_logs() 
RETURNS void AS $$
BEGIN
    DELETE FROM public.audit_logs 
    WHERE retention_date < NOW();
END;
$$ LANGUAGE plpgsql;
```

### Nginx Logs
```nginx
# Configurar logs detalhados
access_log /var/log/nginx/nobilis-ia-access.log;
error_log /var/log/nginx/nobilis-ia-error.log;

# Log de segurança
log_format security '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
```

## 🔄 **PROCESSO DE ATUALIZAÇÃO**

### 1. Backup Completo
```bash
# Backup do banco
pg_dump -h host -U user -d database > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup dos arquivos
tar -czf app_backup_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/nobilis-ia/
```

### 2. Deploy da Atualização
```bash
# Pull das mudanças
git pull origin main

# Instalar dependências
npm ci

# Build
npm run build

# Restart do servidor
sudo systemctl restart nginx
```

### 3. Verificação Pós-Deploy
```bash
# Verificar se o site está funcionando
curl -I https://seudominio.com

# Verificar logs
tail -f /var/log/nginx/nobilis-ia-error.log
```

## 🆘 **PLANO DE CONTINGÊNCIA**

### Em caso de problemas:
1. **Rollback imediato**: Restaurar backup anterior
2. **Isolamento**: Colocar sistema em modo manutenção
3. **Investigação**: Analisar logs para identificar problema
4. **Correção**: Aplicar correção ou rollback permanente
5. **Comunicação**: Notificar usuários sobre o incidente

### Contatos de Emergência:
- Administrador do Sistema: [email]
- Equipe de Desenvolvimento: [email]
- Suporte Supabase: [link]

---

**⚠️ IMPORTANTE**: Este guia deve ser seguido rigorosamente. Qualquer desvio deve ser documentado e aprovado pela equipe de segurança. 