import {
  STAGING_URL_SKY_SUBGRAPH_MAINNET,
  PROD_URL_SKY_SUBGRAPH_MAINNET,
  STAGING_URL_SKY_SUBGRAPH_TESTNET,
  STAGING_URL_SKY_SUBGRAPH_BASE,
  STAGING_URL_SKY_SUBGRAPH_BASE_TENDERLY
} from '@/lib/constants';
import { useState, useEffect } from 'react';
import { useChainId } from 'wagmi';
import { mainnet, base } from 'viem/chains';
import { tenderly, tenderlyBase } from '@/data/wagmi/config/config.default';

export function useSubgraphUrl() {
  const chainId = useChainId();
  const [subgraphUrl, setSubgraphUrl] = useState('');

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
          setSubgraphUrl(STAGING_URL_SKY_SUBGRAPH_BASE); //TODO change to prod
          break;
      }
    }
  }, [chainId]);

  return subgraphUrl;
}
