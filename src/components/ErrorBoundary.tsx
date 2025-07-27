import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log para serviço externo se desejar (ex: Sentry)
    if (import.meta.env.PROD) {
      // Implementar logging de produção aqui se necessário
    } else {
      console.error('Erro capturado pelo ErrorBoundary:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Ocorreu um erro inesperado</h2>
          <p className="mb-4 text-muted-foreground">Tente recarregar a página ou voltar para o início.</p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="bg-red-100 text-red-800 p-4 rounded text-left overflow-x-auto max-w-xl mx-auto">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
} 