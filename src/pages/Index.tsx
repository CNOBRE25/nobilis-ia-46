
<<<<<<< HEAD
import { useState } from "react";
=======
import React, { useState, Suspense, lazy } from "react";
>>>>>>> db1e165157d7892501eb3b9d27658cd6a6100efd
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, BarChart3, BookOpen, Brain, LogOut, Settings, User, KeyRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import LoginForm from "@/components/LoginForm";
import Dashboard from "@/components/Dashboard";
import PareceresSection from "@/components/PareceresSection";
import LegislacaoSection from "@/components/LegislacaoSection";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";
import ProfileDialog from "@/components/ProfileDialog";
import SettingsDialog from "@/components/SettingsDialog";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";

<<<<<<< HEAD
=======
const GerarRelatorioInteligente = lazy(() => import("./GerarRelatorioInteligente"));

>>>>>>> db1e165157d7892501eb3b9d27658cd6a6100efd
const Index = () => {
  const { user, signOut, loading } = useAuth();
  const { profile, isAdmin } = useRoles();
  
  // Estados para controlar os diálogos
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const getUserInitials = () => {
    const name = profile?.nome_completo || profile?.username || user?.email || '';
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const getUserDisplayName = () => {
    return profile?.nome_completo || profile?.username || user?.email?.split('@')[0] || 'Usuário';
  };

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
                {/* <p className="text-muted-foreground text-sm font-light">
                  BEM VINDO, ENCARREGADO! SISTEMA
                </p> */}
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
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-auto px-3 rounded-lg hover:bg-muted/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {getUserDisplayName()}
                          </span>
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            {profile?.role === 'admin' ? 'Admin' : 
                             profile?.role === 'lawyer' ? 'Advogado' : 'Cliente'}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {user?.email}
                        </span>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                          <p className="text-xs leading-none text-muted-foreground mt-1">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          {profile?.role === 'admin' ? 'Administrador do Sistema' : 
                           profile?.role === 'lawyer' ? 'Advogado' : 'Cliente'}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      setShowChangePassword(true);
                    }}
                  >
                    <KeyRound className="mr-2 h-4 w-4" />
                    <span>Alterar Senha</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      setShowProfile(true);
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      setShowSettings(true);
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
<<<<<<< HEAD
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-card border border-border">
=======
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-card border border-border">
>>>>>>> db1e165157d7892501eb3b9d27658cd6a6100efd
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
<<<<<<< HEAD
=======
            <TabsTrigger value="relatorio-ia" className="flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Brain className="h-4 w-4 mr-2" />
              Gerar Relatório Inteligente
            </TabsTrigger>
>>>>>>> db1e165157d7892501eb3b9d27658cd6a6100efd
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
<<<<<<< HEAD
=======

          <TabsContent value="relatorio-ia">
            <Suspense fallback={<div className="text-white">Carregando...</div>}>
              <GerarRelatorioInteligente />
            </Suspense>
          </TabsContent>
>>>>>>> db1e165157d7892501eb3b9d27658cd6a6100efd
        </Tabs>
      </main>
      
      {/* Diálogos controlados por estado */}
      <ChangePasswordDialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <div></div>
      </ChangePasswordDialog>
      
      <ProfileDialog open={showProfile} onOpenChange={setShowProfile}>
        <div></div>
      </ProfileDialog>
      
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings}>
        <div></div>
      </SettingsDialog>
    </div>
  );
};

export default Index;
