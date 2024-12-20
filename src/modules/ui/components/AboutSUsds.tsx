import { Button } from '@/components/ui/button';
import { Trans } from '@lingui/macro';
import { ExternalLinkIcon } from 'lucide-react';
import { ExternalLink } from '@/modules/layout/components/ExternalLink';
import { Heading, Text } from '@/modules/layout/components/Typography';
import { getEtherscanLink } from '@jetstreamgg/utils';
import { useChainId } from 'wagmi';
import { sUsdsAddress } from '@jetstreamgg/hooks';
import { GradientShapeCard } from './GradientShapeCard';

export const AboutSUsds = () => {
  const chainId = useChainId();

  const sUsdsEtherscanLink = getEtherscanLink(
    chainId,
    sUsdsAddress[chainId as keyof typeof sUsdsAddress],
    'address'
  );

  return (
    <GradientShapeCard
      colorLeft="radial-gradient(258.73% 268.92% at 116.69% 275.4%, #F7A7F9 0%, #6D28FF 100%)"
      colorMiddle="linear-gradient(0deg, #F7A7F9 0%, #00DDFB 300%)"
      colorRight="bg-card"
      className="mb-6"
    >
      <div className="w-[80%] space-y-2 lg:w-1/2">
        <Heading>
          <Trans>sUSDS</Trans>
        </Heading>
        <Text variant="small">
          <Trans>
            sUSDS is a savings token for eligible users. When you supply USDS to the Sky Savings Rate module,
            you access the Sky Savings Rate and may receive sUSDS tokens. These sUSDS tokens serve as a
            digital record of your USDS interaction with the SSR module and any value accrued to your
            position.
          </Trans>
        </Text>
      </div>
      <ExternalLink href={sUsdsEtherscanLink} showIcon={false} className="mt-3 w-fit lg:mt-0">
        <Button variant="outline" className="gap-2 border-border">
          <Trans>View contract</Trans>
          <ExternalLinkIcon size={16} />
        </Button>
      </ExternalLink>
    </GradientShapeCard>
  );
};
