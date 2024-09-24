import { useSearchParams } from 'react-router-dom';

import { useConfig as useWagmiConfig } from 'wagmi';
import { TOKENS, useUpgradeHistory } from '@jetstreamgg/hooks';
import {
  TxStatus,
  UpgradeAction,
  UpgradeWidget,
  WidgetStateChangeParams,
  UpgradeFlow,
  UpgradeScreen
} from '@jetstreamgg/widgets';
import { QueryParams, REFRESH_DELAY } from '@/lib/constants';
import { SharedProps } from '@/modules/app/types/Widgets';
import { LinkedActionSteps } from '@/modules/config/context/ConfigContext';
import { useConfigContext } from '@/modules/config/hooks/useConfigContext';
import { useCustomNavigation } from '@/modules/ui/hooks/useCustomNavigation';
import { updateParamsFromTransaction } from '@/modules/utils/updateParamsFromTransaction';
import { capitalizeFirstLetter } from '@/lib/helpers/string/capitalizeFirstLetter';

const targetTokenFromSourceToken = (sourceToken?: string) => {
  if (sourceToken === 'DAI') return 'USDS';
  if (sourceToken === 'MKR') return 'SKY';
  return sourceToken;
};

export function UpgradeWidgetPane(sharedProps: SharedProps) {
  const isRestricted = import.meta.env.VITE_RESTRICTED_BUILD === 'true';
  const { linkedActionConfig, updateLinkedActionConfig, exitLinkedActionMode } = useConfigContext();
  const { mutate: refreshUpgradeHistory } = useUpgradeHistory();

  const wagmiConfig = useWagmiConfig();
  const [, setSearchParams] = useSearchParams();

  const { onNavigate, setCustomHref, customNavLabel, setCustomNavLabel } = useCustomNavigation();

  const onUpgradeWidgetStateChange = ({
    hash,
    txStatus,
    widgetState,
    targetToken
  }: WidgetStateChangeParams) => {
    if (
      widgetState.action === UpgradeAction.UPGRADE &&
      txStatus === TxStatus.SUCCESS &&
      linkedActionConfig.step === LinkedActionSteps.CURRENT_FUTURE
    ) {
      updateLinkedActionConfig({ step: LinkedActionSteps.SUCCESS_FUTURE });
    }

    if (
      hash &&
      txStatus === TxStatus.SUCCESS &&
      [UpgradeAction.UPGRADE, UpgradeAction.REVERT].includes(widgetState.action)
    ) {
      setTimeout(() => {
        refreshUpgradeHistory();
      }, REFRESH_DELAY);

      //If the action is not "revert" inspect the tx receipt and update the URL accordingly
      if (linkedActionConfig?.linkedAction && widgetState.action !== UpgradeAction.REVERT) {
        updateParamsFromTransaction(hash, wagmiConfig, setSearchParams);
      }
    }
    // When we're ready to proceed with the next LA step, set the href & nav label accordingly
    if (
      txStatus === TxStatus.SUCCESS &&
      widgetState.action === UpgradeAction.UPGRADE &&
      linkedActionConfig?.linkedAction &&
      linkedActionConfig.step === LinkedActionSteps.SUCCESS_FUTURE
    ) {
      setCustomHref(
        `/?${QueryParams.Widget}=${linkedActionConfig.linkedAction}&${QueryParams.InputAmount}=${linkedActionConfig?.inputAmount}&${QueryParams.LinkedAction}=${linkedActionConfig.linkedAction}${linkedActionConfig.rewardContract ? `&${QueryParams.Reward}=${linkedActionConfig.rewardContract}` : ''}`
      );
      setCustomNavLabel(`Go to ${capitalizeFirstLetter(linkedActionConfig.linkedAction)}`);
    } else {
      setCustomHref(undefined);
      setCustomNavLabel(undefined);
    }

    //exit upgrade linked action if we start a revert transaction
    if (
      linkedActionConfig.initialAction === UpgradeAction.UPGRADE &&
      widgetState.flow === UpgradeFlow.REVERT &&
      widgetState.screen === UpgradeScreen.TRANSACTION
    ) {
      setSearchParams('');
      exitLinkedActionMode();
    }

    //exit upgrade linked action if we start a transaction with the wrong source token
    if (
      linkedActionConfig.initialAction === UpgradeAction.UPGRADE &&
      widgetState.flow === UpgradeFlow.UPGRADE &&
      widgetState.screen === UpgradeScreen.TRANSACTION &&
      linkedActionConfig.sourceToken &&
      targetToken &&
      targetToken !== targetTokenFromSourceToken(linkedActionConfig.sourceToken)
    ) {
      setSearchParams('');
      exitLinkedActionMode();
    }
  };

  return (
    <UpgradeWidget
      {...sharedProps}
      externalWidgetState={{
        amount: linkedActionConfig?.inputAmount,
        initialUpgradeToken: linkedActionConfig?.sourceToken
      }}
      onWidgetStateChange={onUpgradeWidgetStateChange}
      customNavigationLabel={customNavLabel}
      onCustomNavigation={onNavigate}
      upgradeOptions={isRestricted ? [TOKENS.dai] : [TOKENS.dai, TOKENS.mkr]}
      revertOptions={isRestricted ? [TOKENS.usds] : [TOKENS.usds, TOKENS.sky]}
    />
  );
}
