import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React Component Tree:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    localStorage.removeItem('escriba_token');
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans">
          <div className="w-full max-w-lg bg-card border border-border/80 rounded-2xl shadow-xl p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-critical-surface text-critical flex items-center justify-center mx-auto shadow-xs border border-critical-border">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                Ocorreu uma instabilidade na visualização
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Um componente da interface encontrou um erro inesperado. Seus dados estão seguros e você pode recarregar a tela ou reiniciar sua sessão.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-red-50/60 border border-red-200/80 rounded-lg text-left text-[11px] font-mono text-red-700 overflow-x-auto max-h-36">
                <b>{this.state.error.name}:</b> {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReset}
                className="text-xs font-medium"
              >
                <Home className="w-3.5 h-3.5 mr-1.5" />
                Ir para o Início
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={this.handleReload}
                className="text-xs font-bold bg-primary hover:bg-primary/90 text-white"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Recarregar Sistema
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

