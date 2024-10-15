import { HStack } from '@/modules/layout/components/HStack';
import {
  RiskLevel,
  useDelegates,
  useRewardContractTokens,
  useSealPosition,
  useUrnAddress,
  useVault,
  ZERO_ADDRESS
} from '@jetstreamgg/hooks';
import { formatAddress, formatBigInt, WAD_PRECISION } from '@jetstreamgg/utils';
import { t, Trans } from '@lingui/macro';
import { SealToken } from '../constants';
import { SealPositionRewardsCard } from './SealPositionRewardsCard';
import { SealBorrowedCard, SealSealedCard } from '@/modules/ui/components/BalanceCards';
import { VStack } from '@/modules/layout/components/VStack';
import { StatsCard } from '@/modules/ui/components/StatsCard';
import { TokenIcon } from '@/modules/ui/components/TokenIcon';
import { Heading, Text } from '@/modules/layout/components/Typography';
import { useChainId } from 'wagmi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatUnits } from 'viem';
import { cn } from '@/lib/utils';
import { DetailSection } from '@/modules/ui/components/DetailSection';
import { DetailSectionRow } from '@/modules/ui/components/DetailSectionRow';
import { formatUrnIndex } from './SealPositionDetails';

const RISK_COLORS = {
  [RiskLevel.LIQUIDATION]: { text: 'text-red-400', bg: 'bg-red-400' },
  [RiskLevel.HIGH]: { text: 'text-red-400', bg: 'bg-red-400' },
  [RiskLevel.MEDIUM]: { text: 'text-orange-400', bg: 'bg-orange-400' },
  [RiskLevel.LOW]: { text: 'text-green-400', bg: 'bg-green-400' }
};

export function SealPositionOverview({
  positionIndex
}: {
  positionIndex: number;
}): React.ReactElement | null {
  const chainId = useChainId();
  const { data, isLoading, error } = useSealPosition({ urnIndex: positionIndex });
  const {
    data: urnAddress,
    isLoading: urnAddressLoading
    // error: urnAddressError
  } = useUrnAddress(BigInt(positionIndex));
  const { data: vault, isLoading: vaultLoading, error: vaultError } = useVault(urnAddress || ZERO_ADDRESS);
  const {
    data: rewardContractTokens,
    isLoading: tokensLoading,
    error: tokensError
  } = useRewardContractTokens(data?.selectedReward as `0x${string}` | undefined);
  const {
    data: delegates,
    isLoading: delegatesLoading,
    error: delegatesError
  } = useDelegates({ chainId, pageSize: 1, search: data?.selectedDelegate });

  if (!error && !isLoading && !data) return null;

  const riskColor = vault?.riskLevel ? RISK_COLORS[vault?.riskLevel] : undefined;

  return (
    <DetailSection
      title={
        <div className="flex items-center gap-4">
          <Heading className="my-4">
            <Trans>Your position {formatUrnIndex(BigInt(positionIndex))}</Trans>
          </Heading>
          {riskColor && (
            <div className="flex items-center gap-2">
              <div className={cn('h-2.5 w-2.5 rounded-full', riskColor.bg)} />
              <Text variant="small" className="text-textSecondary">
                <Trans>Risk level</Trans>
              </Text>
            </div>
          )}
        </div>
      }
    >
      <DetailSectionRow>
        <VStack className="gap-8">
          <HStack gap={2} className="scrollbar-thin w-full overflow-auto">
            <SealSealedCard
              label={t`${SealToken.MKR} sealed`}
              token={{ name: 'Maker', symbol: SealToken.MKR }}
              balance={formatBigInt(data?.mkrLocked || 0n)}
              isLoading={isLoading}
              error={error}
            />
            <SealBorrowedCard
              isLoading={isLoading}
              error={error}
              balance={data?.usdsDebt || 0n}
              token={{ name: 'USDS', symbol: 'USDS' }}
            />
            {data?.selectedReward && (
              <SealPositionRewardsCard rewardContractAddress={data.selectedReward as `0x${string}`} />
            )}
          </HStack>
          {(data?.selectedDelegate || data?.selectedReward) && (
            <HStack gap={2} className="w-full">
              {data?.selectedReward && (
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
                      <Text className="mt-2">{formatAddress(data.selectedReward, 6, 4)}</Text>
                    )
                  }
                />
              )}
              {data?.selectedDelegate && (
                <StatsCard
                  title={t`Delegate`}
                  isLoading={delegatesLoading}
                  error={delegatesError}
                  content={
                    delegates ? (
                      <div className="mt-2 flex gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            width={6}
                            height={6}
                            src={delegates[0].metadata?.image}
                            alt={delegates[0].metadata?.name}
                          />
                          <AvatarFallback className="bg-slate-200 text-xs" delayMs={500}>
                            {(delegates[0].metadata?.name.slice(0, 2) || 'SD').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Text>
                          {delegates[0].metadata?.name || formatAddress(data.selectedDelegate, 6, 4)}
                        </Text>
                      </div>
                    ) : (
                      <Text className="mt-2">{formatAddress(data.selectedDelegate, 6, 4)}</Text>
                    )
                  }
                />
              )}
            </HStack>
          )}
          <HStack gap={2} className="scrollbar-thin w-full overflow-auto">
            <StatsCard
              title={t`Collateralization ratio`}
              isLoading={urnAddressLoading || vaultLoading}
              error={urnAddressLoading ? null : vaultError}
              content={
                <Text className={cn('mt-2', riskColor ? riskColor.text : '')}>
                  {(Number(formatUnits(vault?.collateralizationRatio || 0n, WAD_PRECISION)) * 100).toFixed(2)}
                  %
                </Text>
              }
            />
            <StatsCard
              title={t`Liquidation price`}
              isLoading={urnAddressLoading || vaultLoading}
              error={urnAddressLoading ? null : vaultError}
              content={<Text className="mt-2">${formatBigInt(vault?.liquidationPrice || 0n)}</Text>}
            />
            <StatsCard
              title={t`Current price`}
              isLoading={urnAddressLoading || vaultLoading}
              error={urnAddressLoading ? null : vaultError}
              content={<Text className="mt-2">${formatBigInt(vault?.delayedPrice || 0n)}</Text>}
            />
          </HStack>
        </VStack>
      </DetailSectionRow>
    </DetailSection>
  );
}
