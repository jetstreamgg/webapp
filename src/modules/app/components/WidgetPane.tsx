import { BalancesWidget } from '@jetstreamgg/widgets';
import { Balances, Upgrade, Trade, RewardsModule, Savings, Seal } from '../../icons';
import { Intent } from '@/lib/enums';
import { useLingui } from '@lingui/react';
import { useCustomConnectModal } from '@/modules/ui/hooks/useCustomConnectModal';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { mapIntentToQueryParam, restrictedIntents } from '@/lib/constants';
import { WidgetNavigation } from '@/modules/app/components/WidgetNavigation';
import { withErrorBoundary } from '@/modules/utils/withErrorBoundary';
import { DualSwitcher } from '@/components/DualSwitcher';
import { IconProps } from '@/modules/icons/Icon';
import { UpgradeWidgetPane } from '@/modules/upgrade/components/UpgradeWidgetPane';
import { RewardsWidgetPane } from '@/modules/rewards/components/RewardsWidgetPane';
import { TradeWidgetPane } from '@/modules/trade/components/TradeWidgetPane';
import { SavingsWidgetPane } from '@/modules/savings/components/SavingsWidgetPane';
import { useConnectedContext } from '@/modules/ui/context/ConnectedContext';
import React from 'react';
import { useNotification } from '../hooks/useNotification';
import { useActionForToken } from '../hooks/useActionForToken';
import { useRetainedQueryParams } from '@/modules/ui/hooks/useRetainedQueryParams';
import { useNavigate } from 'react-router-dom';
import { useConfigContext } from '@/modules/config/hooks/useConfigContext';
import { defaultConfig } from '@/modules/config/default-config';
import { useChainId } from 'wagmi';
import { SealWidgetPane } from '@/modules/seal/components/SealWidgetPane';

export type WidgetContent = [Intent, string, (props: IconProps) => JSX.Element, JSX.Element][];

type WidgetPaneProps = {
  intent: Intent;
  children?: React.ReactNode;
};

export const WidgetPane = ({ intent, children }: WidgetPaneProps) => {
  const { i18n } = useLingui();
  const chainId = useChainId();
  const onConnect = useCustomConnectModal();
  const addRecentTransaction = useAddRecentTransaction();
  const { isConnectedAndAcceptedTerms } = useConnectedContext();
  const onNotification = useNotification();
  const { onExternalLinkClicked } = useConfigContext();
  const locale = i18n.locale;
  const isRestricted = import.meta.env.VITE_RESTRICTED_BUILD === 'true';

  const rightHeaderComponent = <DualSwitcher />;

  const sharedProps = {
    onConnect,
    addRecentTransaction,
    locale,
    rightHeaderComponent,
    onNotification,
    enabled: isConnectedAndAcceptedTerms,
    onExternalLinkClicked
  };

  const actionForToken = useActionForToken();
  const rewardsUrl = useRetainedQueryParams(`/?widget=${mapIntentToQueryParam(Intent.REWARDS_INTENT)}`);
  const savingsUrl = useRetainedQueryParams(`/?widget=${mapIntentToQueryParam(Intent.SAVINGS_INTENT)}`);

  const navigate = useNavigate();

  const widgetContent: WidgetContent = [
    [
      Intent.BALANCES_INTENT,
      'Balances',
      Balances,
      withErrorBoundary(
        <BalancesWidget
          {...sharedProps}
          hideModuleBalances={isRestricted}
          actionForToken={actionForToken}
          onClickRewardsCard={() => navigate(rewardsUrl)}
          onClickSavingsCard={() => navigate(savingsUrl)}
          customTokenList={defaultConfig.balancesTokenList[chainId]}
        />
      )
    ],
    [
      Intent.REWARDS_INTENT,
      'Rewards',
      RewardsModule,
      withErrorBoundary(<RewardsWidgetPane {...sharedProps} />)
    ],
    [Intent.SAVINGS_INTENT, 'Savings', Savings, withErrorBoundary(<SavingsWidgetPane {...sharedProps} />)],
    [Intent.UPGRADE_INTENT, 'Upgrade', Upgrade, withErrorBoundary(<UpgradeWidgetPane {...sharedProps} />)],
    [Intent.TRADE_INTENT, 'Trade', Trade, withErrorBoundary(<TradeWidgetPane {...sharedProps} />)],
    [Intent.SEAL_INTENT, 'Seal', Seal, withErrorBoundary(<SealWidgetPane {...sharedProps} />)]
  ];

  return (
    <WidgetNavigation
      widgetContent={widgetContent.filter(([intent]) =>
        isRestricted ? !restrictedIntents.includes(intent) : true
      )}
      intent={intent}
    >
      {children}
    </WidgetNavigation>
  );
};
