import { useMemo } from 'react';
import { TransactionTypeEnum, useSealHistory } from '@jetstreamgg/hooks';
import { formatBigInt, useFormatDates } from '@jetstreamgg/utils';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { SavingsSupply, ArrowDown } from '@/modules/icons';
import { HistoryTable } from '@/modules/ui/components/historyTable/HistoryTable';

const mapTypeEnumToColumn = (type: TransactionTypeEnum) => {
  switch (type) {
    case TransactionTypeEnum.SEAL:
    case TransactionTypeEnum.SEAL_SKY:
      return t`Seal`;
    case TransactionTypeEnum.UNSEAL:
    case TransactionTypeEnum.UNSEAL_SKY:
      return t`Unseal`;
    case TransactionTypeEnum.SEAL_REWARD:
      return t`Claim rewards`;
    case TransactionTypeEnum.BORROW:
      return t`Borrow`;
    case TransactionTypeEnum.REPAY:
      return t`Repay`;
    default:
      return '';
  }
};

// TODO: Eventually rewards will be claimed for different tokens as well,
// so we would need to fetch the reward token dynamically
const mapTypeEnumToTokenSymbol = (type: TransactionTypeEnum) => {
  switch (type) {
    case TransactionTypeEnum.SEAL:
    case TransactionTypeEnum.UNSEAL:
      return 'MKR';
    case TransactionTypeEnum.SEAL_SKY:
    case TransactionTypeEnum.UNSEAL_SKY:
      return 'SKY';
    case TransactionTypeEnum.BORROW:
    case TransactionTypeEnum.REPAY:
    case TransactionTypeEnum.SEAL_REWARD:
      return 'USDS';
    default:
      return '';
  }
};

const eventsToInclude = [
  TransactionTypeEnum.SEAL,
  TransactionTypeEnum.SEAL_SKY,
  TransactionTypeEnum.UNSEAL,
  TransactionTypeEnum.UNSEAL_SKY,
  TransactionTypeEnum.SEAL_REWARD,
  TransactionTypeEnum.BORROW,
  TransactionTypeEnum.REPAY
];

const highlightedEvents = [TransactionTypeEnum.SEAL, TransactionTypeEnum.SEAL_SKY, TransactionTypeEnum.REPAY];

export function SealHistory() {
  const { data: sealHistory, isLoading: sealHistoryLoading, error } = useSealHistory();
  const { i18n } = useLingui();

  const memoizedDates = useMemo(() => sealHistory?.map(s => s.blockTimestamp), [sealHistory]);
  const formattedDates = useFormatDates(memoizedDates, i18n.locale, 'MMMM d, yyyy, h:mm a');

  // map seal history to rows
  const history = sealHistory
    // Filter out events that don't have an amount to display
    ?.filter(s => eventsToInclude.includes(s.type))
    .map((s, index) => ({
      id: s.transactionHash,
      type: mapTypeEnumToColumn(s.type),
      highlightText: highlightedEvents.includes(s.type),
      // @ts-expect-error TODO: Update the type of the history items once we have clarity on the events to display in the table
      textLeft: `${formatBigInt(s.amount || 0n, { compact: true })} ${mapTypeEnumToTokenSymbol(s.type)}`,
      iconLeft: highlightedEvents.includes(s.type) ? (
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
      dataTestId="seal-history"
      history={history}
      error={error}
      isLoading={sealHistoryLoading}
      transactionHeader={t`Amount`}
      typeColumn
    />
  );
}
