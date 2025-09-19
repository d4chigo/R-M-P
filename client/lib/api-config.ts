export const getAPIBase = () => {
  const windowEnv = typeof window !== 'undefined' ? (window as any).__env : undefined;
  return (windowEnv && windowEnv.NEXT_PUBLIC_API_URL) || process.env.NEXT_PUBLIC_API_URL || 'https://api-rmdistribuciones.romac-logistic.shop/api';
};
