import { toast, useToast } from '@/components/ui/use-toast';
import { useConfigContext } from '@/modules/config/hooks/useConfigContext';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Text } from '@/modules/layout/components/Typography';
import { HStack } from '@/modules/layout/components/HStack';
import { VStack } from '@/modules/layout/components/VStack';
import { Trans } from '@lingui/macro';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'react-router-dom';
import { BP, useBreakpointIndex } from '@/modules/ui/hooks/useBreakpointIndex';
import { QueryParams } from '@/lib/constants';
import { CHATBOT_NAME } from '@/modules/chat/constants';

export const useChatNotification = ({ isAuthorized }: { isAuthorized: boolean }) => {
  const { userConfig, updateUserConfig } = useConfigContext();
  const { dismiss } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { bpi } = useBreakpointIndex();

  const chatEnabled = import.meta.env.VITE_CHATBOT_ENABLED === 'true';

  const showChat = useMemo(() => chatEnabled && isAuthorized, [chatEnabled, isAuthorized]);

  const onClickChat = useCallback(() => {
    searchParams.set(QueryParams.Chat, 'true');
    if (bpi < BP.xl) searchParams.set(QueryParams.Details, 'false');
    setSearchParams(searchParams);
    setTimeout(() => {
      dismiss();
    }, 300);
  }, [bpi, dismiss, searchParams, setSearchParams]);

  const onClose = useCallback(() => {
    updateUserConfig({ ...userConfig, chatSuggested: true });
  }, [updateUserConfig, userConfig]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (showChat) {
      timerRef.current = setTimeout(() => {
        if (!userConfig.chatSuggested && searchParams.get(QueryParams.Chat) !== 'true') {
          toast({
            title: (
              <Text variant="medium" className="ml-1 text-selectActive">
                {CHATBOT_NAME}
              </Text>
            ),
            description: (
              <HStack className="ml-1 w-full justify-between">
                <VStack className="mt-4">
                  <Text variant="medium">
                    <Trans>Hi, {CHATBOT_NAME} here!</Trans>
                  </Text>
                  <Text variant="medium">
                    <Trans>How can I help you today?</Trans>
                  </Text>
                </VStack>
                <Button className="place-self-end" variant="pill" size="xs" onClick={onClickChat}>
                  <Trans>Start Chatting</Trans>
                </Button>
              </HStack>
            ),
            variant: 'chat',
            duration: Infinity,
            onClose
          });
        }
      }, 5000);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showChat, userConfig.chatSuggested, searchParams]);
};
