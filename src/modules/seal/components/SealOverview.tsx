import { useSealHistoricData } from '@jetstreamgg/hooks';
import { formatDecimalPercentage, formatNumber } from '@jetstreamgg/utils';
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

export function SealOverview() {
  const { isConnectedAndAcceptedTerms } = useConnectedContext();
  const { data, isLoading, error } = useSealHistoricData();
  const mostRecentData = data?.sort(
    (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  )[0];

  const mkrSealed = formatNumber(mostRecentData?.totalMkr ?? 0);
  const usdsDebt = formatNumber(mostRecentData?.totalDebt ?? 0);
  const borrowRate = mostRecentData?.borrowRate ?? 0;
  const tvl = mostRecentData?.tvl ?? 0;
  const numberOfUrns = mostRecentData?.numberOfUrns ?? 0;

  return (
    <DetailSectionWrapper>
      <DetailSection title={t`Seal Engine Overview`}>
        <DetailSectionRow>
          <HStack gap={2} className="scrollbar-thin w-full overflow-auto">
            <StatsCard
              title={t`Total MKR sealed`}
              isLoading={isLoading}
              error={error}
              content={
                <TokenIconWithBalance
                  className="mt-2"
                  token={{ name: 'MKR', symbol: 'MKR' }}
                  balance={mkrSealed}
                />
              }
            />
            <StatsCard
              title={t`Total USDS borrowed`}
              isLoading={isLoading}
              error={error}
              content={
                <TokenIconWithBalance
                  className="mt-2"
                  token={{ name: 'USDS', symbol: 'USDS' }}
                  balance={usdsDebt}
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
      <DetailSection title={t`Rewards overview`}>
        <DetailSectionRow>
          <SealRewardsOverview />
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
