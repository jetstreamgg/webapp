import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Text } from '@/modules/layout/components/Typography';
import { Trans } from '@lingui/macro';
import { useChainId, useChains, useClient, useSwitchChain } from 'wagmi';
import { MainnetChain, BaseChain, Close } from '@/modules/icons';
import { cn } from '@/lib/utils';
import { base } from 'viem/chains';
import { ChevronDown } from 'lucide-react';
import { tenderlyBase } from '@/data/wagmi/config/config.default';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QueryParams } from '@/lib/constants';

enum ChainModalVariant {
  default = 'default',
  widget = 'widget'
}

const getChainIcon = (chainId: number, className?: string) =>
  [base.id, tenderlyBase.id].includes(chainId) ? (
    <BaseChain className={className} />
  ) : (
    <MainnetChain className={className} />
  );

export function ChainModal({
  showLabel = true,
  showDropdownIcon = true,
  variant = 'default',
  dataTestId = 'chain-modal-trigger'
}: {
  showLabel?: boolean;
  showDropdownIcon?: boolean;
  variant?: 'default' | 'widget';
  dataTestId?: string;
}) {
  const [open, setOpen] = useState(false);
  const chainId = useChainId();
  const client = useClient();
  const chains = useChains();
  const { switchChain, variables: switchChainVariables, isPending: isSwitchChainPending } = useSwitchChain();
  const [, setSearchParams] = useSearchParams();
  const handleSwitchChain = (chainId: number) => {
    switchChain(
      { chainId },
      {
        onSuccess: (_, { chainId: newChainId }) => {
          const newChainName = chains.find(c => c.id === newChainId)?.name;
          if (newChainName) {
            setSearchParams(params => {
              params.set(QueryParams.Network, newChainName.toLowerCase());
              return params;
            });
          }
        },
        onSettled: () => setOpen(false)
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="connect"
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-2',
            variant === ChainModalVariant.widget &&
              'border-transparent bg-primary bg-blend-overlay px-[9px] hover:border-transparent hover:bg-white/10 hover:[--gradient-opacity:100%] focus:border-transparent focus:bg-white/15 focus:[--gradient-opacity:100%]'
          )}
          data-testid={dataTestId}
        >
          {getChainIcon(chainId, variant === ChainModalVariant.widget ? 'h-5 w-5' : 'h-6 w-6')}
          {showLabel && <Text className="text-text">{client?.chain.name || 'Ethereum'}</Text>}
          {showDropdownIcon && <ChevronDown width={14} height={14} />}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="bg-containerDark p-4 sm:min-w-[400px] sm:p-4"
        onOpenAutoFocus={e => e.preventDefault()}
        onCloseAutoFocus={e => e.preventDefault()}
      >
        <DialogHeader>
          <Text className="pl-2 text-[28px] text-text md:text-[32px]">
            <Trans>Switch chain</Trans>
          </Text>
        </DialogHeader>
        <div className="flex flex-col items-start gap-1">
          {chains.map(chain => (
            <Button
              key={chain.id}
              onClick={() => handleSwitchChain(chain.id)}
              className={cn(
                'flex w-full justify-between p-1.5',
                chainId === chain.id && 'hover:bg-primary focus:bg-primary active:bg-primary'
              )}
              variant={chainId === chain.id ? 'default' : 'ghost'}
            >
              <div className="flex items-center gap-3">
                {getChainIcon(chain.id)}
                <Text className={cn('text-left text-text')}>{chain.name}</Text>
              </div>
              {chainId === chain.id && (
                <div className="mr-1.5 flex items-center gap-2">
                  <Text variant="medium">Connected</Text>
                  <div className="h-2 w-2 rounded-full bg-bullish" />
                </div>
              )}
              {isSwitchChainPending && switchChainVariables.chainId === chain.id && (
                <div className="mr-1.5 flex items-center gap-2">
                  <Text variant="medium">Confirm in your wallet</Text>
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                </div>
              )}
            </Button>
          ))}
        </div>
        <DialogClose asChild>
          <Button
            variant="outline"
            className="absolute right-4 top-[26px] h-8 w-8 rounded-full p-0 text-text"
            data-testid="chain-modal-close"
          >
            <Close />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
