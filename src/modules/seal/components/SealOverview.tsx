import { useSealHistoricData, useCollateralData } from '@jetstreamgg/hooks';
import { formatDecimalPercentage, formatNumber, math, formatBigInt } from '@jetstreamgg/utils';
import { DetailSectionRow } from '@/modules/ui/components/DetailSectionRow';
import { DetailSectionWrapper } from '@/modules/ui/components/DetailSectionWrapper';
import { DetailSection } from '@/modules/ui/components/DetailSection';
import { t, Trans } from '@lingui/macro';
import { HStack } from '@/modules/layout/components/HStack';
import { StatsCard } from '@/modules/ui/components/StatsCard';
import { TokenIconWithBalance } from '@/modules/ui/components/TokenIconWithBalance';
import { Heading, Text } from '@/modules/layout/components/Typography';
import { AboutSealModule } from '@/modules/ui/components/AboutSealModule';
import { useConnectedContext } from '@/modules/ui/context/ConnectedContext';
import { SealHistory } from './SealHistory';
import { SealRewardsOverview } from './SealRewardsOverview';
import { SealFaq } from './SealFaq';
import { SealChart } from './SealChart';
import { PopoverRateInfo } from '@/modules/ui/components/PopoverRateInfo';
import { useMemo } from 'react';
import { useConfigContext } from '@/modules/config/hooks/useConfigContext';
import { SealToken } from '../constants';

export function SealOverview() {
  const { isConnectedAndAcceptedTerms } = useConnectedContext();
  const { userConfig } = useConfigContext();
  const { data, isLoading, error } = useSealHistoricData();
  const mostRecentData = data?.sort(
    (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  )[0];

  const mkrSealed = formatNumber(mostRecentData?.totalMkr ?? 0);
  const skySealed = useMemo(() => {
    return formatNumber(
      mostRecentData?.totalMkr ? mostRecentData?.totalMkr * Number(math.MKR_TO_SKY_PRICE_RATIO) : 0
    );
  }, [mostRecentData?.totalMkr]);

  const borrowRate = mostRecentData?.borrowRate ?? 0;
  const tvl = mostRecentData?.tvl ?? 0;
  const numberOfUrns = mostRecentData?.numberOfUrns ?? 0;

  const {
    data: collateralData,
    isLoading: collateralDataLoading,
    error: collateralDataError
  } = useCollateralData();
  const debtCeiling = collateralData?.debtCeiling ?? 0n;
  const totalDebt = collateralData?.totalDaiDebt ?? 0n;

  return (
    <DetailSectionWrapper>
      <DetailSection title={t`Seal Engine Overview`}>
        <DetailSectionRow>
          <HStack gap={2} className="scrollbar-thin w-full overflow-auto">
            <StatsCard
              title={t`Total ${userConfig?.sealToken} sealed`}
              isLoading={isLoading}
              error={error}
              content={
                userConfig?.sealToken === SealToken.SKY ? (
                  <TokenIconWithBalance
                    className="mt-2"
                    token={{ name: SealToken.SKY, symbol: SealToken.SKY }}
                    balance={skySealed}
                  />
                ) : (
                  <TokenIconWithBalance
                    className="mt-2"
                    token={{ name: SealToken.MKR, symbol: SealToken.MKR }}
                    balance={mkrSealed}
                  />
                )
              }
            />
            <StatsCard
              title={t`Total USDS borrowed`}
              isLoading={collateralDataLoading}
              error={collateralDataError}
              content={
                <TokenIconWithBalance
                  className="mt-2"
                  token={{ name: 'USDS', symbol: 'USDS' }}
                  balance={formatBigInt(totalDebt)}
                />
              }
            />
            <StatsCard
              title={t`Debt ceiling`}
              isLoading={collateralDataLoading}
              error={collateralDataError}
              content={
                <TokenIconWithBalance
                  className="mt-2"
                  token={{ name: 'USDS', symbol: 'USDS' }}
                  balance={formatBigInt(debtCeiling)}
                />
              }
            />
          </HStack>
        </DetailSectionRow>
        <DetailSectionRow>
          <HStack gap={2} className="scrollbar-thin w-full overflow-auto">
            <StatsCard
              title={
                <HStack gap={1} className="items-center">
                  <Heading tag="h3" className="text-sm font-normal leading-tight text-textSecondary">
                    <Trans>Borrow Rate</Trans>
                  </Heading>
                  <PopoverRateInfo type="sbr" />
                </HStack>
              }
              isLoading={isLoading}
              error={error}
              content={<Text className="mt-2">{formatDecimalPercentage(borrowRate)}</Text>}
            />
            <StatsCard
              title={t`TVL`}
              isLoading={isLoading}
              error={error}
              content={<Text className="mt-2">{`$${formatNumber(tvl)}`}</Text>}
            />
            <StatsCard
              title={t`Seal Positions`}
              isLoading={isLoading}
              error={error}
              content={<Text className="mt-2">{numberOfUrns}</Text>}
            />
          </HStack>
        </DetailSectionRow>
      </DetailSection>
      <DetailSection title={t`Rewards overview`}>
        <DetailSectionRow>
          <SealRewardsOverview />
        </DetailSectionRow>
      </DetailSection>
      {isConnectedAndAcceptedTerms && (
        <DetailSection title={t`Your Seal Engine transaction history`}>
          <DetailSectionRow>
            <SealHistory />
          </DetailSectionRow>
        </DetailSection>
      )}
      <DetailSection title={t`Metrics`}>
        <DetailSectionRow>
          <SealChart />
        </DetailSectionRow>
      </DetailSection>
      <DetailSection title={t`About Seal Rewards`}>
        <DetailSectionRow>
          <AboutSealModule />
        </DetailSectionRow>
      </DetailSection>
      <DetailSection title={t`FAQs`}>
        <DetailSectionRow>
          <SealFaq />
        </DetailSectionRow>
      </DetailSection>
    </DetailSectionWrapper>
  );
}
