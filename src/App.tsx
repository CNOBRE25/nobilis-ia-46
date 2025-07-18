
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SupabaseTestPage from "./pages/SupabaseTestPage";
import FunctionalityTablePage from "./pages/FunctionalityTablePage";
import ProcessTestPage from "./pages/ProcessTestPage";
import TestPage from "./pages/TestPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/test-supabase" element={<SupabaseTestPage />} />
            <Route path="/funcionalidades" element={<FunctionalityTablePage />} />
            <Route path="/test-processos" element={<ProcessTestPage />} />
            <Route path="/criar-teste" element={<TestPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
