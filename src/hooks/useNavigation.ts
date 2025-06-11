// hooks/useNavigation.ts
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export const useNavigation = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const navigateTo = (path: string, key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    
    startTransition(() => {
      try {
        router.push(path);
      } catch (error) {
        console.error('Navigation failed:', error);
      } finally {
        setLoadingStates(prev => ({ ...prev, [key]: false }));
      }
    });
  };

  const isLoading = (key: string) => loadingStates[key] || isPending;
  const isAnyLoading = Object.values(loadingStates).some(Boolean) || isPending;

  return { navigateTo, isLoading, isAnyLoading };
};