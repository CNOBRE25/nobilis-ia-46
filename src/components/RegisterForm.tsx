
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, UserPlus, AlertTriangle, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
// import { useAudit } from "@/hooks/useAudit"; // Temporariamente desabilitado
import { registerSchema, RegisterFormData, sanitizeInput } from "@/utils/validation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import TermsOfUseDialog from "./TermsOfUseDialog";

interface RegisterFormProps {
  onBack: () => void;
  onRegisterSuccess: () => void;
}

const RegisterForm = ({ onBack, onRegisterSuccess }: RegisterFormProps) => {
  const { signUp } = useAuth();
  // const { logEvent } = useAudit(); // Temporariamente desabilitado
  const [showTerms, setShowTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [password, setPassword] = useState("");

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      nomeCompleto: "",
      matricula: "",
      cargoFuncao: "",
    },
  });

  const cargos = [
    "SD PM", "SD BM", "CB PM", "CB BM", "3º SGT PM", "3º SGT BM",
    "2º SGT PM", "2º SGT BM", "1º SGT PM", "1º SGT BM", "ST PM", "ST BM",
    "2º TEN PM", "2º TEN BM", "1º TEN PM", "1º TEN BM", "CAP PM", "CAP BM",
    "MAJOR PM", "MAJOR BM", "TC PM", "TC BM", "CORONEL PM", "CORONEL BM",
    "DPC", "APC", "EPC", "PERITO CRIMINAL", "ASP"
  ];

  // Função para validar senha em tempo real
  const validatePassword = (password: string) => {
    const rules = [
      { test: password.length >= 8, label: "Mínimo 8 caracteres" },
      { test: /[A-Z]/.test(password), label: "Uma letra maiúscula" },
      { test: /[a-z]/.test(password), label: "Uma letra minúscula" },
      { test: /[0-9]/.test(password), label: "Um número" },
      { test: /[^A-Za-z0-9]/.test(password), label: "Um caractere especial" },
    ];
    return rules;
  };

  const passwordRules = validatePassword(password);

  const handleSubmit = async (data: RegisterFormData) => {
    if (!aceitouTermos) {
      form.setError("root", {
        message: "Você deve aceitar os termos de uso para continuar."
      });
      return;
    }

    // Debug: Log dos dados do formulário
    console.log("Dados do formulário:", {
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      nomeCompleto: data.nomeCompleto,
      matricula: data.matricula,
      cargoFuncao: data.cargoFuncao
    });

    // Debug: Validar senha localmente
    const passwordValidation = validatePassword(data.password);
    const allRulesMet = passwordValidation.every(rule => rule.test);
    console.log("Validação local da senha:", {
      password: data.password,
      rules: passwordValidation,
      allRulesMet
    });

    // Sanitizar dados de entrada
    const sanitizedData = {
      ...data,
      nomeCompleto: sanitizeInput(data.nomeCompleto),
      matricula: sanitizeInput(data.matricula),
    };

    const userData = {
      nome_completo: sanitizedData.nomeCompleto,
      matricula: sanitizedData.matricula,
      cargo_funcao: sanitizedData.cargoFuncao,
    };

    console.log("Dados sanitizados:", sanitizedData);
    console.log("Dados do usuário:", userData);

    const { error } = await signUp(sanitizedData.email, sanitizedData.password, userData);
    
    if (error) {
      console.error("Erro no signUp:", error);
    } else {
      console.log("SignUp realizado com sucesso");
      // await logEvent('SIGN_UP_SUCCESS', undefined, {
      //   email: sanitizedData.email,
      //   cargo: sanitizedData.cargoFuncao
      // }); // Temporariamente desabilitado
      onRegisterSuccess();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border shadow-lg">
          <CardHeader className="text-center pb-3">
            <div className="flex justify-center mb-2">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-lg font-bold text-foreground">Cadastro de Encarregado</CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Preencha os dados para solicitar acesso
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2.5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-foreground">E-mail *</FormLabel>
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
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-foreground">Senha *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite sua senha"
                            className="h-8 text-sm"
                            onChange={(e) => {
                              field.onChange(e);
                              setPassword(e.target.value);
                            }}
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
                      
                      {/* Indicador de regras de senha */}
                      {password && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-muted-foreground font-medium">Requisitos da senha:</p>
                          {passwordRules.map((rule, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              {rule.test ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-500" />
                              )}
                              <span className={rule.test ? "text-green-600" : "text-red-600"}>
                                {rule.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-foreground">Confirmar Senha *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirme sua senha"
                            className="h-8 text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-2"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
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

                <FormField
                  control={form.control}
                  name="nomeCompleto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-foreground">Nome Completo *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Nome completo"
                          className="h-8 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="matricula"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-foreground">Matrícula *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Número da matrícula"
                          className="h-8 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cargoFuncao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-foreground">Cargo/Função *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Selecione seu cargo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cargos.map(cargo => (
                            <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="termos"
                      checked={aceitouTermos}
                      onCheckedChange={(checked) => setAceitouTermos(checked as boolean)}
                    />
                    <div className="text-xs">
                      <label htmlFor="termos" className="cursor-pointer text-foreground font-medium">
                        Aceito os{" "}
                        <button
                          type="button"
                          onClick={() => setShowTerms(true)}
                          className="text-primary hover:text-primary/80 underline font-semibold hover:bg-primary/10 px-1 py-0.5 rounded transition-colors"
                        >
                          termos de uso
                        </button>{" "}
                        da plataforma NOBILIS-IA
                      </label>
                    </div>
                  </div>

                  {form.formState.errors.root && (
                    <p className="text-xs text-destructive">{form.formState.errors.root.message}</p>
                  )}

                  <Alert className="bg-primary/5 border-primary/20">
                    <AlertTriangle className="h-3 w-3 text-primary" />
                    <AlertDescription className="text-foreground text-xs">
                      <strong>Importante:</strong> Após o cadastro, aguarde a autorização do administrador para validar seu acesso.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="space-y-2 pt-2">
                  <Button 
                    type="submit" 
                    className="w-full h-8 text-sm"
                    disabled={!aceitouTermos || form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3 mr-2" />
                        Solicitar Cadastro
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-8 text-sm"
                    onClick={onBack}
                  >
                    Voltar ao Login
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <TermsOfUseDialog 
        open={showTerms} 
        onOpenChange={setShowTerms} 
      />
    </>
  );
};

export default RegisterForm;
