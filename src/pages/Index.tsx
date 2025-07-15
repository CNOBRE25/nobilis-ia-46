
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Users, BarChart3, BookOpen, Brain } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/LoginForm";
import Dashboard from "@/components/Dashboard";
import PareceresSection from "@/components/PareceresSection";
import LegislacaoSection from "@/components/LegislacaoSection";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const { profile, isAdmin } = useRoles();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        <div className="text-center">
          <Brain className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        <div className="w-full max-w-md px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Brain className="h-12 w-12 text-primary mr-3" />
                <div className="absolute inset-0 h-12 w-12 bg-primary/10 rounded-full blur-lg"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  NOBILIS-IA
                </h1>
                <p className="text-muted-foreground text-sm font-light">
                  PLATAFORMA INTELIGENTE
                </p>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative">
                <Brain className="h-10 w-10 text-primary mr-3 ai-pulse" />
                <div className="absolute inset-0 h-10 w-10 bg-primary/20 rounded-full blur-md ai-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  NOBILIS-IA
                </h1>
                <p className="text-sm text-muted-foreground">PLATAFORMA INTELIGENTE</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end">
                <Badge variant="outline" className="bg-card text-card-foreground border-border">
                  {profile?.role === 'admin' ? 'Administrador' : 
                   profile?.role === 'lawyer' ? 'Advogado' : 'Cliente'}
                </Badge>
                <span className="text-xs text-muted-foreground mt-1">
                  {profile?.username || user.email}
                </span>
              </div>
              <Button 
                variant="outline" 
                className="ai-button-secondary"
                onClick={signOut}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-card border border-border">
            <TabsTrigger value="dashboard" className="flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="pareceres" className="flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4 mr-2" />
              Pareceres
            </TabsTrigger>
            <TabsTrigger value="legislacao" className="flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="h-4 w-4 mr-2" />
              Legislação
            </TabsTrigger>
            {isAdmin() && (
              <TabsTrigger value="usuarios" className="flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="h-4 w-4 mr-2" />
                Usuários
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard user={profile} />
          </TabsContent>

          <TabsContent value="pareceres">
            <PareceresSection user={profile} />
          </TabsContent>

          <TabsContent value="legislacao">
            <LegislacaoSection />
          </TabsContent>

          {isAdmin() && (
            <TabsContent value="usuarios">
              <div className="text-center py-12">
                <Card className="ai-card max-w-md mx-auto">
                  <CardContent className="pt-6">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">Gestão de Usuários</h3>
                    <p className="text-muted-foreground">Módulo em desenvolvimento</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
