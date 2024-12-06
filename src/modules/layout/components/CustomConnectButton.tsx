import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { TermsModal } from '../../ui/components/TermsModal';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { t } from '@lingui/macro';
import { useConnectedContext } from '@/modules/ui/context/ConnectedContext';

export function CustomConnectButton(props: any) {
  const defaultProps = {
    accountStatus: {
      smallScreen: 'avatar',
      largeScreen: 'full'
    },
    chainStatus: 'none',
    showBalance: false,
    label: 'Connect Wallet'
  };
  const mergedProps = { ...defaultProps, ...props };
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();

  const { isConnectedAndAcceptedTerms } = useConnectedContext();

  return !isConnectedAndAcceptedTerms ? (
    <TermsModal />
  ) : !isConnected ? (
    <Button variant="connect" onClick={openConnectModal}>
      {props.label ? props.label : t`Connect Wallet`}
    </Button>
  ) : (
    <div className="p-0">
      {/*ConnectButton is transparent and thus looks like its parent button */}
      <ConnectButton {...mergedProps} />
    </div>
  );
}
