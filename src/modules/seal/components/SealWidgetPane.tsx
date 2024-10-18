import { SealModuleWidget, TxStatus, WidgetStateChangeParams, SealFlow } from '@jetstreamgg/widgets';
import { IntentMapping, QueryParams, REFRESH_DELAY } from '@/lib/constants';
import { SharedProps } from '@/modules/app/types/Widgets';
import { LinkedActionSteps } from '@/modules/config/context/ConfigContext';
import { useConfigContext } from '@/modules/config/hooks/useConfigContext';
import { useSearchParams } from 'react-router-dom';
import { deleteSearchParams } from '@/modules/utils/deleteSearchParams';
import { Intent } from '@/lib/enums';

export function SealWidgetPane(sharedProps: SharedProps) {
  const {
    linkedActionConfig,
    updateLinkedActionConfig,
    exitLinkedActionMode,
    // selectedSealUrnIndex,
    setSelectedSealUrnIndex
  } = useConfigContext();
  // TODO: Implemet `useSealHistory` hook
  const refreshSealHistory = () => {};
  // const { mutate: refreshSealHistory } = useSealHistory();
  const [, setSearchParams] = useSearchParams();

  const onSealUrnChange = (urn?: { urnAddress: `0x${string}` | undefined; urnIndex: bigint | undefined }) => {
    setSearchParams(params => {
      if (urn?.urnAddress && urn?.urnIndex !== undefined) {
        params.set(QueryParams.Widget, IntentMapping[Intent.SEAL_INTENT]);
        params.set(QueryParams.SealUrnIndex, urn.urnIndex.toString());
      } else {
        params.delete(QueryParams.SealUrnIndex);
      }
      return params;
    });
    setSelectedSealUrnIndex(urn?.urnIndex !== undefined ? Number(urn.urnIndex) : undefined);
  };

  const onSealWidgetStateChange = ({ hash, txStatus, widgetState }: WidgetStateChangeParams) => {
    // After a successful linked action open flow, set the final step to "success"
    if (
      widgetState.flow === SealFlow.OPEN &&
      txStatus === TxStatus.SUCCESS &&
      linkedActionConfig.step === LinkedActionSteps.COMPLETED_CURRENT
    ) {
      updateLinkedActionConfig({ step: LinkedActionSteps.COMPLETED_SUCCESS });
    }

    // Reset the linked action state and URL params after clicking "finish"
    if (txStatus === TxStatus.IDLE && linkedActionConfig.step === LinkedActionSteps.COMPLETED_SUCCESS) {
      exitLinkedActionMode();
      setSearchParams(prevParams => {
        const params = deleteSearchParams(prevParams);
        return params;
      });
    }

    if (
      hash &&
      txStatus === TxStatus.SUCCESS &&
      [SealFlow.OPEN, SealFlow.MANAGE].includes(widgetState.flow)
    ) {
      setTimeout(() => {
        refreshSealHistory();
      }, REFRESH_DELAY);
    }
  };
  return (
    <SealModuleWidget
      {...sharedProps}
      onSealUrnChange={onSealUrnChange}
      onWidgetStateChange={onSealWidgetStateChange}
      externalWidgetState={{ amount: linkedActionConfig?.inputAmount }}
    />
  );
}
