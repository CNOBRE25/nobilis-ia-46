
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
      <Card className="w-full bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            {showForgotPassword ? "Recuperar Senha" : "Acesso ao Sistema"}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {showForgotPassword 
              ? "Informe seu e-mail para receber instruções de recuperação"
              : "Entre com suas credenciais para acessar o NOBILIS-IA"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
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
                          {...field}
                          type="email"
                          placeholder="Digite seu e-mail"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={resetForm.formState.isSubmitting}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {resetForm.formState.isSubmitting ? "Enviando..." : "Enviar Instruções"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Voltar ao Login
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Digite seu e-mail"
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
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite sua senha"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
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
                    className="text-primary hover:text-primary/80 p-0 h-auto"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Esqueci a senha
                  </Button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginForm.formState.isSubmitting}
                >
                  {loginForm.formState.isSubmitting ? "Entrando..." : "Entrar no Sistema"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Novo no sistema?
                  </p>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowRegister(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Cadastrar Novo Encarregado
                  </Button>
                </div>
              </form>
            </Form>
          )}

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Problemas com acesso?{" "}
              <Button variant="link" className="text-primary hover:text-primary/80 p-0 h-auto">
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
