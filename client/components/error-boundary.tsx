"use client";

import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 dark:bg-red-900 p-4">
          <h1 className="text-3xl font-bold text-red-700 dark:text-red-400 mb-4">
            ❌ Ha ocurrido un error
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Algo salió mal en la aplicación. Por favor, inténtalo nuevamente más tarde.
          </p>
          <pre className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto">
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
