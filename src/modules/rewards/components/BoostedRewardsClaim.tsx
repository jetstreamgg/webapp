import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBoostedRewards } from '@jetstreamgg/hooks';
import { Rewards, RewardsEmpty, Rocket } from '@/modules/icons';
import { TokenIconWithBalance } from '@/modules/ui/components/TokenIconWithBalance';
import { Trans } from '@lingui/macro';
import { useAccount } from 'wagmi';
import { formatBigInt } from '@jetstreamgg/utils';
import { mapIntentToQueryParam } from '@/lib/constants';
import { Intent } from '@/lib/enums';
import { Link } from 'react-router-dom';

const JAN_01_2025_TIMESTAMP = new Date('January 1, 2025').getTime();

export const BoostedRewardsClaim = () => {
  const { address } = useAccount();
  const { data, isLoading, error } = useBoostedRewards(address);

  const isBoostedRewardsPeriodEnded = new Date().getTime() >= JAN_01_2025_TIMESTAMP;

  if (!address || !data || error || !data?.has_rewards || data?.is_claimed || isBoostedRewardsPeriodEnded) {
    return null;
  }

  return (
    <div className="mb-8">
      <Card variant="stats" className="flex justify-between border border-borderPurple">
        <div className="flex flex-col justify-center">
          <div className="align-center mb-2 flex items-center">
            <CardTitle variant="stats">
              <Trans>Boosted Rewards</Trans>
            </CardTitle>
            <Rocket className="ml-1 mr-2" height="16" width="18" />
            <Button size="xs" variant="chip" className="bg-primary" asChild>
              <Link to={`/?widget=${mapIntentToQueryParam(Intent.REWARDS_INTENT)}`}>
                <Trans>Claim all</Trans>
              </Link>
            </Button>
          </div>
          {isLoading ? (
            <Skeleton className="h5 w-16" />
          ) : (
            <TokenIconWithBalance
              token={{ symbol: 'SKY', name: 'New Governance Token' }}
              balance={formatBigInt(data.amount || 0n)}
            />
          )}
        </div>
        {data?.amount && data?.amount > 0 ? <Rewards /> : <RewardsEmpty />}
      </Card>
    </div>
  );
};
