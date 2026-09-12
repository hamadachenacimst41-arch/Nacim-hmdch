import React, { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('GCB Suivi Chantier App Error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center text-2xl font-bold mb-4 border border-amber-500/30">
            GCB
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Une erreur inattendue est survenue
          </h1>
          <p className="text-sm text-slate-400 max-w-md mb-4">
            L'affichage a rencontré un problème temporaire. Vous pouvez actualiser la page ou réinitialiser le cache local.
          </p>
          {this.state.error && (
            <div className="text-xs text-red-300/80 bg-red-950/40 p-2.5 rounded-lg border border-red-900/50 mb-6 max-w-lg overflow-x-auto font-mono text-left">
              {this.state.error.message || String(this.state.error)}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-sm shadow-md transition-all"
            >
              Actualiser la page
            </button>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-sm border border-slate-700 transition-all"
            >
              Réinitialiser le cache
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

