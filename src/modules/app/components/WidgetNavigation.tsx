import { useRef, useEffect, useState, useCallback } from 'react';
import { Intent } from '../../../lib/enums';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { BP, useBreakpointIndex } from '@/modules/ui/hooks/useBreakpointIndex';
import { Text } from '@/modules/layout/components/Typography';
import { Trans } from '@lingui/macro';
import { WidgetContent } from './WidgetPane';
import { AnimatePresence, motion } from 'framer-motion';
import { cardAnimations } from '@/modules/ui/animation/presets';
import { AnimationLabels } from '@/modules/ui/animation/constants';
import { useConfigContext } from '@/modules/config/hooks/useConfigContext';
import { QueryParams, mapIntentToQueryParam } from '@/lib/constants';
import { LinkedActionWrapper } from '@/modules/ui/components/LinkedActionWrapper';
import { useSearchParams } from 'react-router-dom';
import { deleteSearchParams } from '@/modules/utils/deleteSearchParams';
import { cn } from '@/lib/utils';

interface WidgetNavigationProps {
  widgetContent: WidgetContent;
  intent?: Intent;
  children?: React.ReactNode;
}

export function WidgetNavigation({ widgetContent, intent, children }: WidgetNavigationProps): JSX.Element {
  const { bpi } = useBreakpointIndex();
  const isMobile = bpi < BP.md;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);
  const {
    selectedRewardContract,
    linkedActionConfig: { showLinkedAction }
  } = useConfigContext();
  const isRewardsOverview = !selectedRewardContract && intent === Intent.REWARDS_INTENT;

  const [, setSearchParams] = useSearchParams();

  const handleWidgetChange = (value: string) => {
    const queryParam = mapIntentToQueryParam(value as Intent);

    setSearchParams(prevParams => {
      // delete the query params when we navigate to a different widget by tab click
      const searchParams = deleteSearchParams(prevParams);

      // set the new widget parameter
      searchParams.set(QueryParams.Widget, queryParam);

      // I think this part needs to move too
      if (value === Intent.REWARDS_INTENT) {
        if (selectedRewardContract?.contractAddress)
          searchParams.set(QueryParams.Reward, selectedRewardContract.contractAddress);
      } else {
        searchParams.delete(QueryParams.Reward);
      }
      return searchParams;
    });
  };

  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) return;

    const updateSize = () => {
      setHeight(containerElement.offsetHeight);
    };
    updateSize();

    // Create observer to watch for changes in card size
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerElement);

    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  const contentMarginTop = isMobile ? 0 : 8;
  const contentPaddingTop = isMobile ? 0 : 2;
  const laExtraHeight = isMobile ? 61 : 100; // LA Wrapper and action button height
  const baseTabContentClasses = 'md:h-full md:flex-1';
  const tabContentClasses = isRewardsOverview
    ? `${baseTabContentClasses} p-6 pb-0 md:p-3 md:pb-3 md:pr-0.5 md:pt-2 xl:p-4 xl:pb-4 xl:pr-1.5`
    : `${baseTabContentClasses} p-6 md:p-3 md:pr-0.5 md:pt-2 xl:p-4 xl:pr-1.5`;
  // If it's mobile, use the widget navigation row height + the height of the webiste header
  // as we're using 100vh for the content style, if not, just use the height of the navigation row
  const headerHeight = (isMobile ? 63 + 56 : 66) + (contentMarginTop + contentPaddingTop) * 4;
  const topOffset = headerHeight;
  const style = isMobile
    ? { height: `calc(100vh - ${topOffset + (showLinkedAction ? laExtraHeight : 0)}px)` }
    : { height: `${height - topOffset - (showLinkedAction ? laExtraHeight : 0)}px` };
  const tabGlowClasses =
    'before:top-[-13px] xl:before:top-[-17px] before:absolute before:left-1/2 before:-translate-x-1/2 before:w-[120%] before:h-px before:bg-nav-light';

  // Memoized scroll function
  const scrollToTop = useCallback(() => {
    if (isMobile) {
      widgetRef.current?.scrollIntoView(true);
    }
  }, [isMobile]);

  // Effect to scroll to top when intent changes
  useEffect(() => {
    scrollToTop();
  }, [intent, scrollToTop]);

  return (
    <Tabs
      ref={containerRef}
      className={
        'w-full md:flex md:min-w-[352px] md:max-w-[440px] md:flex-col md:gap-8 lg:min-w-[416px] lg:max-w-[416px] xl:p-1'
      }
      defaultValue={Intent.BALANCES_INTENT}
      onValueChange={handleWidgetChange}
      value={intent}
      asChild
      activationMode="manual"
    >
      <motion.div layout transition={{ layout: { duration: 0 } }}>
        {/* TODO justify-around only when restricted */}
        <TabsList
          className={`${isMobile ? 'space-x-1' : ''} sticky top-0 z-20 flex w-full justify-around rounded-none rounded-t-3xl border-b p-3 backdrop-blur-2xl md:border-none md:p-0 md:backdrop-filter-none`}
        >
          {widgetContent.map(([widgetIntent, label, icon]) => (
            <TabsTrigger
              key={widgetIntent}
              variant="icons"
              value={widgetIntent}
              className={intent === widgetIntent ? cn(tabGlowClasses, 'px-1 md:px-2') : 'px-1 md:px-2'}
            >
              {!isMobile && icon({ color: intent === widgetIntent ? 'white' : 'rgba(198, 194, 255, 0.8)' })}
              <Text variant="small">
                <Trans>{label}</Trans>
              </Text>
            </TabsTrigger>
          ))}
        </TabsList>
        <LinkedActionWrapper />
        <AnimatePresence initial={false} mode="popLayout">
          {widgetContent.map(
            ([int, , , content]) =>
              intent === int && (
                <TabsContent key={int} value={int} className={tabContentClasses} style={style} asChild>
                  <motion.div
                    variants={cardAnimations}
                    initial={AnimationLabels.initial}
                    animate={AnimationLabels.animate}
                    exit={AnimationLabels.exit}
                    ref={widgetRef}
                    className={
                      isMobile
                        ? showLinkedAction
                          ? 'scroll-mt-[148px]'
                          : 'scroll-mt-[87px]'
                        : 'scroll-mt-[0px]'
                    }
                  >
                    {content}
                  </motion.div>
                </TabsContent>
              )
          )}
          {children}
        </AnimatePresence>
      </motion.div>
    </Tabs>
  );
}
