
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, UserPlus, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, resetPasswordSchema, LoginFormData, ResetPasswordFormData } from "@/utils/validation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import RegisterForm from "./RegisterForm";

const LoginForm = () => {
  const { signIn, resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const loginForm = useForm<LoginFormData>({
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
    await signIn(data.email, data.password);
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    const { error } = await resetPassword(data.email);
    if (!error) {
      setShowForgotPassword(false);
      resetForm.reset();
    }
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
  };

  if (showRegister) {
    return (
      <RegisterForm
        onBack={() => setShowRegister(false)}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  return (
    <div className="w-full">
      <Card className="w-full bg-card/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="text-center pb-3">
          <div className="flex justify-center mb-2">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-lg font-bold text-foreground">
            {showForgotPassword ? "Recuperar Senha" : "Acesso ao Sistema"}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            {showForgotPassword 
              ? "Informe seu e-mail para receber instruções de recuperação"
              : "Entre com suas credenciais para acessar o NOBILIS-IA"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {showForgotPassword ? (
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-2.5">
                <FormField
                  control={resetForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-foreground">E-mail</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Digite seu e-mail"
                          className="h-8 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2 pt-2">
                  <Button 
                    type="submit" 
                    className="w-full h-8 text-sm"
                    disabled={resetForm.formState.isSubmitting}
                  >
                    <Mail className="h-3 w-3 mr-2" />
                    {resetForm.formState.isSubmitting ? "Enviando..." : "Enviar Instruções"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-8 text-sm"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Voltar ao Login
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-2.5">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-foreground">E-mail</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Digite seu e-mail"
                          className="h-8 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-foreground">Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite sua senha"
                            className="h-8 text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-right">
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-primary hover:text-primary/80 p-0 h-auto text-xs"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Esqueci a senha
                  </Button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-8 text-sm"
                  disabled={loginForm.formState.isSubmitting}
                >
                  {loginForm.formState.isSubmitting ? "Entrando..." : "Entrar no Sistema"}
                </Button>

                <div className="text-center pt-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    Novo no sistema?
                  </p>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full h-8 text-sm"
                    onClick={() => setShowRegister(true)}
                  >
                    <UserPlus className="h-3 w-3 mr-2" />
                    Cadastrar Novo Encarregado
                  </Button>
                </div>
              </form>
            </Form>
          )}

          <div className="mt-3 text-center">
            <p className="text-xs text-muted-foreground">
              Problemas com acesso?{" "}
              <Button variant="link" className="text-primary hover:text-primary/80 p-0 h-auto text-xs">
                Contate o suporte
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
