
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Shield, Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, resetPasswordSchema, LoginFormData, ResetPasswordFormData } from "@/utils/validation";
import { config, getSecurityConfig } from "@/config/environment";
import { Alert, AlertDescription } from "@/components/ui/alert";
import RegisterForm from "./RegisterForm";

export default function LoginForm() {
  const { signIn, resetPassword, isAccountLocked, sessionExpiresAt } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const securityConfig = getSecurityConfig();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await resetPassword(data.email);
      if (!error) {
        setShowForgotPassword(false);
        resetForm.reset();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeRemaining = (expiresAt: Date | null): string => {
    if (!expiresAt) return '';
    
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirada';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  if (showRegister) {
    return (
      <RegisterForm onBack={() => setShowRegister(false)} onRegisterSuccess={() => setShowRegister(false)} />
    );
  }

  return (
    <div className="w-full">
      <Card className="w-full max-w-md mx-auto bg-background/90 backdrop-blur-md border-border/40 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {showForgotPassword ? "Recuperar Senha" : "Acesso ao Sistema"}
          </CardTitle>
          <CardDescription>
            {showForgotPassword 
              ? "Digite seu e-mail para receber instruções de recuperação"
              : "Digite suas credenciais para acessar o NOBILIS-IA"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Security Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Máximo {securityConfig.maxLoginAttempts} tentativas de login</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Sessão expira em {securityConfig.sessionTimeout / 60} minutos</span>
            </div>
          </div>

          {/* Account Locked Alert */}
          {isAccountLocked && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Sua conta está temporariamente bloqueada devido a múltiplas tentativas de login falhadas.
                Aguarde alguns minutos antes de tentar novamente.
              </AlertDescription>
            </Alert>
          )}

          {/* Session Timeout Warning */}
          {sessionExpiresAt && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Sua sessão expira em {formatTimeRemaining(sessionExpiresAt)}
              </AlertDescription>
            </Alert>
          )}

          {showForgotPassword ? (
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
                <FormField
                  control={resetForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Digite seu e-mail"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowForgotPassword(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? "Enviando..." : "Enviar"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Digite seu e-mail"
                          disabled={isLoading || isAccountLocked}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite sua senha"
                            disabled={isLoading || isAccountLocked}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading || isAccountLocked}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || isAccountLocked}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>
          )}

          {/* Forgot Password Link */}
          {!showForgotPassword && securityConfig.enablePasswordReset && (
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setShowForgotPassword(true)}
                disabled={isLoading}
                className="text-sm"
              >
                Esqueci minha senha
              </Button>
            </div>
          )}
          {/* Botão Criar Conta */}
          {!showForgotPassword && (
            <div className="text-center pt-2">
              <Button
                variant="outline"
                className="w-full h-8 text-sm"
                onClick={() => setShowRegister(true)}
                disabled={isLoading}
              >
                Criar conta
              </Button>
            </div>
          )}

          {/* Environment Information (Development Only) */}
          {config.app.environment === 'development' && (
            <div className="text-xs text-gray-500 text-center space-y-1">
              <div>Ambiente: {config.app.environment}</div>
              <div>Versão: {config.app.version}</div>
              <div>Auditoria: {securityConfig.enableAuditLogs ? 'Ativada' : 'Desativada'}</div>
            </div>
          )}

          {/* Security Information Footer */}
          <div className="text-xs text-gray-500 text-center">
            <div className="flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Conexão segura e criptografada</span>
            </div>
            <div className="mt-1">
              Todas as atividades são registradas para auditoria
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
