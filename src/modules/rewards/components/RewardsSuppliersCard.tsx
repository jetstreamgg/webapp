import { StatsCard } from '@/modules/ui/components/StatsCard';
import { Text } from '@/modules/layout/components/Typography';
import { t } from '@lingui/macro';
import { useRewardsSuppliersCount } from '../hooks/useRewardsSuppliersCount';
import { useChainId } from 'wagmi';
import { isBaseChainId } from '@jetstreamgg/utils';

export function RewardsSuppliersCard() {
  const chainId = useChainId();
  const {
    data: suppliers,
    isLoading,
    error
  } = useRewardsSuppliersCount(isBaseChainId(chainId) ? 1 : chainId); // Display mainnet data on Base
  return (
    <StatsCard
      title={t`Rewards Suppliers`}
      isLoading={isLoading}
      error={error}
      content={
        <Text className="mt-2" variant="large">
          {`${suppliers}`}
        </Text>
      }
    />
  );
}
