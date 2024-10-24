import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingStatCard() {
  return (
    <Card className="flex h-[89.5px] min-w-[208px] items-center justify-between">
      <div className="flex flex-col justify-between">
        <Skeleton className="mb-2 h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </Card>
  );
}
