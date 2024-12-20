import {
  STAGING_URL_SKY_SUBGRAPH_MAINNET,
  PROD_URL_SKY_SUBGRAPH_MAINNET,
  STAGING_URL_SKY_SUBGRAPH_TESTNET,
  STAGING_URL_SKY_SUBGRAPH_BASE,
  STAGING_URL_SKY_SUBGRAPH_BASE_TENDERLY,
  PROD_URL_SKY_SUBGRAPH_BASE
} from '@/lib/constants';
import { useState, useEffect } from 'react';
import { useChainId } from 'wagmi';
import { mainnet, base } from 'viem/chains';
import { tenderly, tenderlyBase } from '@/data/wagmi/config/config.default';

export function useSubgraphUrl(overrideChainId?: number) {
  const connectedChainId = useChainId();
  const [subgraphUrl, setSubgraphUrl] = useState('');
  const chainId = overrideChainId ?? connectedChainId;

  useEffect(() => {
    if (import.meta.env.VITE_ENV_NAME === 'staging' || import.meta.env.VITE_ENV_NAME === 'development') {
      switch (chainId) {
        case mainnet.id:
          setSubgraphUrl(STAGING_URL_SKY_SUBGRAPH_MAINNET);
          break;
        case base.id:
          setSubgraphUrl(STAGING_URL_SKY_SUBGRAPH_BASE);
          break;
        case tenderlyBase.id:
          setSubgraphUrl(STAGING_URL_SKY_SUBGRAPH_BASE_TENDERLY);
          break;
        case tenderly.id:
          setSubgraphUrl(STAGING_URL_SKY_SUBGRAPH_TESTNET);
          break;
        default:
          setSubgraphUrl(PROD_URL_SKY_SUBGRAPH_MAINNET);
      }
    } else {
      switch (chainId) {
        case mainnet.id:
          setSubgraphUrl(PROD_URL_SKY_SUBGRAPH_MAINNET);
          break;
        case base.id:
          setSubgraphUrl(PROD_URL_SKY_SUBGRAPH_BASE);
          break;
      }
    }
  }, [chainId]);

  return subgraphUrl;
}
