export const getAPIBase = () => {
  const windowEnv = typeof window !== 'undefined' ? (window as any).__env : undefined;
  return (windowEnv && windowEnv.NEXT_PUBLIC_API_URL) || 'http://localhost:4000/api';
};