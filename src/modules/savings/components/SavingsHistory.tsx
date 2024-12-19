import { useMemo } from 'react';
import { useSavingsHistory } from '@jetstreamgg/hooks';
import { formatBigInt, useFormatDates } from '@jetstreamgg/utils';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { absBigInt } from '../../utils/math';
import { SavingsSupply, ArrowDown } from '@/modules/icons';
import { HistoryTable } from '@/modules/ui/components/historyTable/HistoryTable';
import { useSubgraphUrl } from '@/modules/app/hooks/useSubgraphUrl';

export function SavingsHistory() {
  const subgraphUrl = useSubgraphUrl();
  const { data: savingsHistory, isLoading: savingsHistoryLoading, error } = useSavingsHistory(subgraphUrl);
  const { i18n } = useLingui();

  const memoizedDates = useMemo(() => savingsHistory?.map(s => s.blockTimestamp), [savingsHistory]);
  const formattedDates = useFormatDates(memoizedDates, i18n.locale, 'MMMM d, yyyy, h:mm a');

  // map savings history to rows
  const history = savingsHistory?.map((s, index) => ({
    id: s.transactionHash,
    type: s.assets > 0 ? t`Supply` : t`Withdrawal`,
    highlightText: s.assets > 0,
    textLeft: `${formatBigInt(absBigInt(s.assets), { compact: true })} USDS`,
    iconLeft:
      s.assets > 0 ? (
        <SavingsSupply width={14} height={13} className="mr-1" />
      ) : (
        <ArrowDown width={10} height={14} className="mr-1 fill-white" />
      ),
    formattedDate: formattedDates.length > index ? formattedDates[index] : '',
    rawDate: s.blockTimestamp,
    transactionHash: s.transactionHash
  }));

  return (
    <HistoryTable
      dataTestId="savings-history"
      history={history}
      error={error}
      isLoading={savingsHistoryLoading}
      transactionHeader={t`Amount`}
      typeColumn
    />
  );
}
