import { useUpgradeTotals } from '@jetstreamgg/hooks';
import { formatBigInt } from '@jetstreamgg/utils';
import { t } from '@lingui/macro';
import { StatsCard } from '@/modules/ui/components/StatsCard';
import { TokenIconWithBalance } from '@/modules/ui/components/TokenIconWithBalance';
import { useSubgraphUrl } from '@/modules/app/hooks/useSubgraphUrl';
import { useChainId } from 'wagmi';
import { isBaseChainId } from '@jetstreamgg/utils';

export function UpgradedDaiToUsds() {
  const chainId = useChainId();
  const chainIdToUse = isBaseChainId(chainId) ? 1 : chainId;
  const subgraphUrl = useSubgraphUrl(chainIdToUse);
  const { data, isLoading, error } = useUpgradeTotals({ subgraphUrl });

  return (
    <StatsCard
      title={t`Total DAI upgraded`}
      isLoading={isLoading}
      error={error}
      content={
        <TokenIconWithBalance
          className="mt-2"
          token={{ symbol: 'DAI', name: 'dai' }}
          balance={data?.totalDaiUpgraded ? formatBigInt(data?.totalDaiUpgraded) : '0'}
          chainId={chainIdToUse}
        />
      }
    />
  );
}
