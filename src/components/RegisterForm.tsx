
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, UserPlus, AlertTriangle, Eye, EyeOff } from "lucide-react";
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

  const handleSubmit = async (data: RegisterFormData) => {
    if (!aceitouTermos) {
      form.setError("root", {
        message: "Você deve aceitar os termos de uso para continuar."
      });
      return;
    }

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

    const { error } = await signUp(sanitizedData.email, sanitizedData.password, userData);
    
    if (!error) {
      // await logEvent('SIGN_UP_SUCCESS', undefined, {
      //   email: sanitizedData.email,
      //   cargo: sanitizedData.cargoFuncao
      // }); // Temporariamente desabilitado
      onRegisterSuccess();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-white/95 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <Shield className="h-10 w-10 text-blue-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Cadastro de Encarregado</CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              Preencha os dados para solicitar acesso
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">E-mail *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Digite seu e-mail"
                          className="h-9"
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
                      <FormLabel className="text-sm font-medium">Senha *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite sua senha"
                            className="h-9"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
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

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Confirmar Senha *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirme sua senha"
                            className="h-9"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
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
                      <FormLabel className="text-sm font-medium">Nome Completo *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Nome completo"
                          className="h-9"
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
                      <FormLabel className="text-sm font-medium">Matrícula *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Número da matrícula"
                          className="h-9"
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
                      <FormLabel className="text-sm font-medium">Cargo/Função *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-9">
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

                <div className="space-y-3 pt-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="termos"
                      checked={aceitouTermos}
                      onCheckedChange={(checked) => setAceitouTermos(checked as boolean)}
                    />
                    <div className="text-sm">
                      <label htmlFor="termos" className="cursor-pointer text-gray-800 font-medium">
                        Aceito os{" "}
                        <button
                          type="button"
                          onClick={() => setShowTerms(true)}
                          className="text-blue-700 hover:text-blue-900 underline font-semibold hover:bg-blue-50 px-1 py-0.5 rounded transition-colors"
                        >
                          termos de uso
                        </button>{" "}
                        da plataforma NOBILIS-IA
                      </label>
                    </div>
                  </div>

                  {form.formState.errors.root && (
                    <p className="text-sm text-red-600">{form.formState.errors.root.message}</p>
                  )}

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      <strong>Importante:</strong> Após o cadastro, aguarde a autorização do administrador para validar seu acesso.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="space-y-2 pt-3">
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 h-9"
                    disabled={!aceitouTermos || form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Solicitar Cadastro
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-9"
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
