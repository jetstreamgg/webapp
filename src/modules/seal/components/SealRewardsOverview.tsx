import { HStack } from '@/modules/layout/components/HStack';
import { Text } from '@/modules/layout/components/Typography';
import { VStack } from '@/modules/layout/components/VStack';
import { LoadingErrorWrapper } from '@/modules/ui/components/LoadingErrorWrapper';
import { LoadingStatCard } from '@/modules/ui/components/LoadingStatCard';
import { StatsCard } from '@/modules/ui/components/StatsCard';
import { TokenIcon } from '@/modules/ui/components/TokenIcon';
import {
  useRewardContractInfo,
  useRewardContractTokens,
  useRewardsChartInfo,
  useRewardsRate,
  useSaRewardContracts
} from '@jetstreamgg/hooks';
import { formatAddress, formatBigInt } from '@jetstreamgg/utils';
import { t, Trans } from '@lingui/macro';
import { useChainId } from 'wagmi';

const SealRewardsOverviewRow = ({ contractAddress }: { contractAddress: `0x${string}` }) => {
  const chainId = useChainId();
  const {
    data: rewardContractTokens,
    isLoading: tokensLoading,
    error: tokensError
  } = useRewardContractTokens(contractAddress);

  const {
    data: rewardInfo,
    isLoading: rewardInfoLoading,
    error: rewardInfoError
  } = useRewardContractInfo({ chainId, rewardContractAddress: contractAddress });

  const {
    data: rewardRate,
    isLoading: rateLoading,
    error: rateError
  } = useRewardsRate({ chainId, contractAddress });

  const {
    data: historicRewardsTokenData,
    isLoading: historicRewardsTokenIsLoading,
    error: historicRewardsTokenError
  } = useRewardsChartInfo({
    rewardContractAddress: contractAddress
  });
  const mostRecentReward = historicRewardsTokenData
    ?.slice()
    .sort((a, b) => b.blockTimestamp - a.blockTimestamp)[0];

  return (
    <HStack gap={2} className="scrollbar-thin w-full overflow-auto">
      <StatsCard
        title={t`Reward`}
        isLoading={tokensLoading}
        error={tokensError}
        content={
          rewardContractTokens ? (
            <div className="mt-2 flex gap-2">
              <TokenIcon token={rewardContractTokens.rewardsToken} className="h-6 w-6" />
              <Text>{rewardContractTokens.rewardsToken.symbol}</Text>
            </div>
          ) : (
            <Text className="mt-2">{formatAddress(contractAddress, 6, 4)}</Text>
          )
        }
      />
      <StatsCard
        title={t`Rate`}
        isLoading={rateLoading}
        error={rateError}
        content={<Text className="mt-2">{rewardRate.formatted}</Text>}
      />
      <StatsCard
        title={t`TVL (Total Value Locked)`}
        isLoading={rewardInfoLoading}
        error={rewardInfoError}
        content={<Text className="mt-2">{formatBigInt(rewardInfo?.totalSupplied || 0n)}</Text>}
      />
      <StatsCard
        title={t`Suppliers`}
        isLoading={historicRewardsTokenIsLoading}
        error={historicRewardsTokenError}
        content={<Text className="mt-2">{mostRecentReward?.suppliers || ''}</Text>}
      />
    </HStack>
  );
};

export function SealRewardsOverview() {
  const { data, isLoading, error } = useSaRewardContracts();

  return (
    <LoadingErrorWrapper
      isLoading={isLoading}
      loadingComponent={
        <HStack gap={2} className="scrollbar-thin w-full overflow-auto">
          {[1, 2, 3, 4].map(i => (
            <LoadingStatCard key={i} />
          ))}
        </HStack>
      }
      error={error}
      errorComponent={
        <Text variant="large" className="text-center text-text">
          <Trans>We couldn&amp;t load the Seal module rewards. Please try again later.</Trans>
        </Text>
      }
    >
      <VStack gap={8}>
        {data?.map(({ contractAddress }) => (
          <SealRewardsOverviewRow key={contractAddress} contractAddress={contractAddress} />
        ))}
      </VStack>
    </LoadingErrorWrapper>
  );
}
