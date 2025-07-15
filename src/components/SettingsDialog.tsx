import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Monitor, Moon, Sun, Bell, Shield, Lock, Globe, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";

interface SettingsDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function SettingsDialog({ children, open, onOpenChange }: SettingsDialogProps) {
  const { user, sessionExpiresAt } = useAuth();
  const { profile } = useRoles();
  const [isOpen, setIsOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange !== undefined ? onOpenChange : setIsOpen;
  const [isLoading, setIsLoading] = useState(false);

  // Estados para as configurações (simulados - em uma implementação real, viriam do backend)
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [autoLogout, setAutoLogout] = useState(true);
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('pt-BR');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento das configurações
      console.log("Configurações salvas:", {
        notifications,
        emailNotifications,
        systemAlerts,
        autoLogout,
        theme,
        language,
        timezone,
      });
      
      // Em uma implementação real, você salvaria no Supabase:
      // await supabase.from('user_settings').upsert({
      //   user_id: user?.id,
      //   notifications,
      //   email_notifications: emailNotifications,
      //   ...
      // });
      
    } finally {
      setIsLoading(false);
    }
  };

  const formatSessionExpiration = () => {
    if (!sessionExpiresAt) return 'Não configurado';
    
    const now = new Date();
    const expiry = new Date(sessionExpiresAt);
    const diffMinutes = Math.round((expiry.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMinutes <= 0) return 'Expirada';
    if (diffMinutes < 60) return `${diffMinutes} minutos`;
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configurações
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configurações de Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure como você deseja receber notificações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações do Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações sobre atividades do sistema
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por E-mail</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações importantes por e-mail
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Segurança</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações sobre atividades de segurança suspeitas
                  </p>
                </div>
                <Switch
                  checked={systemAlerts}
                  onCheckedChange={setSystemAlerts}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Aparência */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Monitor className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>
                Customize a aparência da interface do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Claro
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Escuro
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Sistema
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fuso Horário</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                    <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Segurança
              </CardTitle>
              <CardDescription>
                Configure opções de segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Logout Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Desconectar automaticamente após período de inatividade
                  </p>
                </div>
                <Switch
                  checked={autoLogout}
                  onCheckedChange={setAutoLogout}
                />
              </div>

              <div className="space-y-2">
                <Label>Informações da Sessão</Label>
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>E-mail:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sessão expira em:</span>
                    <Badge variant="outline">{formatSessionExpiration()}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tipo de conta:</span>
                    <Badge variant="secondary">
                      {profile?.role === 'admin' ? 'Administrador' : 
                       profile?.role === 'lawyer' ? 'Advogado' : 'Cliente'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5" />
                Sistema
              </CardTitle>
              <CardDescription>
                Informações e configurações gerais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Versão</p>
                  <p className="text-sm text-muted-foreground">1.0.0</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Ambiente</p>
                  <p className="text-sm text-muted-foreground">Produção</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Último Backup</p>
                  <p className="text-sm text-muted-foreground">Hoje às 03:00</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant="default" className="text-xs">Online</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 