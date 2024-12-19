import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Intent } from '@/lib/enums';
import { mapIntentToQueryParam } from '@/lib/constants';
import { t } from '@lingui/macro';
import { cn } from '@/lib/utils';
import { HStack } from '@/modules/layout/components/HStack';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Heading } from '@/modules/layout/components/Typography';
import { useRetainedQueryParams } from '@/modules/ui/hooks/useRetainedQueryParams';

type ModuleCardProps = {
  className: string;
  title: string;
  intent: Intent;
  module: string;
  hide?: boolean;
};

export const ModuleCard = ({ className, title, intent, module, hide }: ModuleCardProps) => {
  if (hide) {
    return null;
  }

  const url = useRetainedQueryParams(`/?widget=${mapIntentToQueryParam(intent)}`);
  return (
    <Link to={url} className="flex flex-1 basis-full flex-col xl:basis-[20%]">
      <Card className={cn('flex h-full flex-col justify-between bg-[length:100%_100%]', className)}>
        <CardTitle className="mb-7 font-custom-450 font-normal leading-8">{t`${title}`}</CardTitle>
        <CardContent className="p-0 pb-2">
          <HStack className="items-center justify-between">
            <Heading variant="extraSmall">{t`Go to ${module}`}</Heading>
            <ArrowRight />
          </HStack>
        </CardContent>
      </Card>
    </Link>
  );
};
