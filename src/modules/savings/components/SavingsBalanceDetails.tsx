import { useSavingsData } from '@jetstreamgg/hooks';
import { SuppliedBalanceCard, UnsuppliedBalanceCard } from '@/modules/ui/components/BalanceCards';
import { useTokenBalance, usdcBaseAddress } from '@jetstreamgg/hooks';
import { useChainId, useAccount } from 'wagmi';
import { isBaseChainId } from '@jetstreamgg/utils';

export function SavingsBalanceDetails() {
  const chainId = useChainId();
  const { address } = useAccount();
  const { data, isLoading, error } = useSavingsData();
  const { data: usdcBalance } = useTokenBalance({
    chainId,
    address,
    token: usdcBaseAddress[chainId as keyof typeof usdcBaseAddress],
    enabled: isBaseChainId(chainId)
  });
  console.log('usdcBalance', usdcBalance);
  const usdsToken = { name: 'USDS', symbol: 'USDS' };
  const usdcToken = { name: 'USDC', symbol: 'USDC', decimals: 6 };
  return (
    <div className="flex w-full flex-col justify-between gap-3 xl:flex-row">
      <SuppliedBalanceCard
        balance={data?.userSavingsBalance || 0n}
        isLoading={isLoading}
        token={usdsToken}
        error={error}
      />
      <UnsuppliedBalanceCard
        balance={data?.userNstBalance || 0n}
        isLoading={isLoading}
        token={usdsToken}
        error={error}
      />
      <UnsuppliedBalanceCard
        balance={usdcBalance?.value || 0n}
        isLoading={isLoading}
        token={usdcToken}
        error={error}
      />
    </div>
  );
}
