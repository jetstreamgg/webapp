import { useSavingsData } from '@jetstreamgg/hooks';
import { SuppliedBalanceCard, UnsuppliedBalanceCard } from '@/modules/ui/components/BalanceCards';
import { useTokenBalance, usdcBaseAddress } from '@jetstreamgg/hooks';
import { useChainId, useAccount } from 'wagmi';
import { isBaseChainId } from '@jetstreamgg/utils';
import { useSsrAssetsToShares, TOKENS } from '@jetstreamgg/hooks';

export function SavingsBalanceDetails() {
  const chainId = useChainId();
  const { address } = useAccount();
  const { data, isLoading, error } = useSavingsData();
  const isBase = isBaseChainId(chainId);
  const { data: usdcBalance } = useTokenBalance({
    chainId,
    address,
    token: usdcBaseAddress[chainId as keyof typeof usdcBaseAddress],
    enabled: isBase
  });

  const usdsToken = { name: 'USDS', symbol: 'USDS' };
  const usdcToken = { name: 'USDC', symbol: 'USDC', decimals: 6 };

  const { formatted } = useSsrAssetsToShares(data?.userSavingsBalance || 0n, TOKENS.usds);

  const SuppliedSavingsBalanceCard = () => {
    return (
      <SuppliedBalanceCard
        balance={data?.userSavingsBalance || 0n}
        isLoading={isLoading}
        token={usdsToken}
        error={error}
        afterBalance={isBase ? ` (${formatted} sUSDS)` : undefined}
      />
    );
  };

  const UsdsBalanceCard = () => {
    return (
      <UnsuppliedBalanceCard
        balance={data?.userNstBalance || 0n}
        isLoading={isLoading}
        token={usdsToken}
        error={error}
      />
    );
  };

  const UsdcBalanceCard = () => {
    return (
      <UnsuppliedBalanceCard
        balance={usdcBalance?.value || 0n}
        isLoading={isLoading}
        token={usdcToken}
        error={error}
      />
    );
  };

  return isBase ? (
    <div className="flex w-full flex-col gap-3">
      <div className="w-full">
        <SuppliedSavingsBalanceCard />
      </div>
      <div className="flex w-full flex-col justify-between gap-3 xl:flex-row">
        <UsdsBalanceCard />
        <UsdcBalanceCard />
      </div>
    </div>
  ) : (
    <div className="flex w-full flex-col justify-between gap-3 xl:flex-row">
      <SuppliedSavingsBalanceCard />
      <UsdsBalanceCard />
    </div>
  );
}
