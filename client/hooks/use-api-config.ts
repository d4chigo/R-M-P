// Hook to get API configuration safely
export function useApiConfig() {
  const getAPIBase = () => {
    if (typeof window !== 'undefined' && (window as any).__env && (window as any).__env.NEXT_PUBLIC_API_URL) {
      return (window as any).__env.NEXT_PUBLIC_API_URL;
    }
    return 'http://localhost:4000/api';
  };

  return {
    baseUrl: getAPIBase()
  };
}