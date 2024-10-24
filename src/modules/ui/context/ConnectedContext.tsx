import { sanitizeUrl } from '@/lib/utils';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

interface ConnectedContextType {
  isConnectedAndAcceptedTerms: boolean;
  setHasAcceptedTerms: (value: boolean) => void;
  isCheckingTerms: boolean;
}

const ConnectedContext = createContext<ConnectedContextType>({
  isConnectedAndAcceptedTerms: false,
  setHasAcceptedTerms: () => {},
  isCheckingTerms: false
});

export const ConnectedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected, address } = useAccount();
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isCheckingTerms, setIsCheckingTerms] = useState(false);

  const checkTermsAcceptance = async (address: string) => {
    setIsCheckingTerms(true);
    try {
      const response = await fetch(sanitizeUrl(`${import.meta.env.VITE_TERMS_ENDPOINT}/check`) || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address })
      });

      if (response.ok) {
        const res = await response.json();
        setIsCheckingTerms(false);
        return res;
      } else {
        console.error('Failed to send signature');
        setIsCheckingTerms(false);
        // Handle error (e.g., show error message to user)
      }
    } catch (error) {
      console.error('Error sending signature:', error);
      setIsCheckingTerms(false);
      // Handle error (e.g., show error message to user)
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      checkTermsAcceptance(address).then(({ termsAccepted }) => {
        setHasAcceptedTerms(termsAccepted);
      });
    } else {
      setHasAcceptedTerms(false);
    }
  }, [isConnected, address]);

  const isConnectedAndAcceptedTerms = isConnected && hasAcceptedTerms;

  return (
    <ConnectedContext.Provider value={{ isConnectedAndAcceptedTerms, setHasAcceptedTerms, isCheckingTerms }}>
      {children}
    </ConnectedContext.Provider>
  );
};

export const useConnectedContext = () => useContext(ConnectedContext);
