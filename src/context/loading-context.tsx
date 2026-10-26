'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isPageLoading: boolean;
  setIsPageLoading: (isLoading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPageLoading, setIsPageLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isPageLoading, setIsPageLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const usePageLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('usePageLoading must be used within a LoadingProvider');
  }
  return context;
};
