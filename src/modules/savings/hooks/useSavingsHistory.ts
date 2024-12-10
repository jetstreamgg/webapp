import { useSavingsHistory as useEthereumSavingsHistory, useBaseSavingsHistory } from '@jetstreamgg/hooks';
import { isBaseChainId } from '@jetstreamgg/utils';
import { useChainId } from 'wagmi';

export function useSavingsHistory({ subgraphUrl }: { subgraphUrl: string }) {
  const chainId = useChainId();
  const baseSavingsHistory = useBaseSavingsHistory({ subgraphUrl });
  const ethereumSavingsHistory = useEthereumSavingsHistory({ subgraphUrl });

  if (isBaseChainId(chainId)) {
    return baseSavingsHistory;
  }
  return ethereumSavingsHistory;
}
