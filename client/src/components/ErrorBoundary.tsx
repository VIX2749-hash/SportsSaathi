import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#201215] text-[#FAF7F0] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#2c181c] border border-[#4a282f] rounded-3xl p-8 text-center shadow-2xl">
            <span className="font-display text-4xl text-[#CCFF00] block mb-3">SPORTS SAATHI</span>
            <h2 className="font-display text-2xl uppercase tracking-tight mb-2">Something went wrong</h2>
            <p className="text-xs text-[#E5E0D8] mb-6">
              A view encountered an unexpected issue. Don't worry, your data and session are safe.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-6 py-2.5 rounded-full bg-[#CCFF00] text-[#121212] font-display font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#bbf000]"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('mt_demo_user');
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="px-6 py-2.5 rounded-full bg-[#FAF7F0] text-[#221013] font-display font-bold text-xs uppercase tracking-wider shadow-md hover:bg-white"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
