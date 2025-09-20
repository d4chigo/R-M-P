// Hook to get API configuration safely
export function useApiConfig() {
  const getAPIBase = () => {
    if (typeof window !== 'undefined' && (window as any).__env && (window as any).__env.NEXT_PUBLIC_API_URL) {
      return (window as any).__env.NEXT_PUBLIC_API_URL;
    }
    return process.env.NEXT_PUBLIC_API_URL || 'https://api-rmdistribuciones.romac-logistic.shop/api';
  };

  return {
    baseUrl: getAPIBase()
  };
}
