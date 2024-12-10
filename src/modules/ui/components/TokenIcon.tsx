import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Token } from '@jetstreamgg/hooks';
import { isBaseChainId } from '@jetstreamgg/utils';
import React from 'react';
import { useChainId } from 'wagmi';

export function TokenIcon({
  token,
  width = 50,
  className,
  fallbackClassName
}: {
  token: Partial<Token> & { symbol: string };
  width?: number;
  className?: string;
  fallbackClassName?: string;
}): React.ReactElement {
  const chainId = useChainId();
  if (!token.symbol) return <></>;

  const path = `/tokens/${isBaseChainId(chainId) ? 'base/' : ''}${token.symbol.toLowerCase()}.svg`;

  return (
    <Avatar className={cn('', className)}>
      <AvatarImage width={width} height={width} src={path} alt={token.name} />
      <AvatarFallback className={cn('bg-slate-200 text-xs', fallbackClassName)} delayMs={500}>
        {token.symbol.toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
