import { HStack } from '@/modules/layout/components/HStack';
import { DetailsSwitcher } from './DetailsSwitcher';
import { NetworkSwitcher } from './NetworkSwitcher';
import { ChatSwitcher } from './ChatSwitcher';

export function DualSwitcher(): JSX.Element {
  const chatEnabled = import.meta.env.VITE_CHATBOT_ENABLED === 'true';
  return (
    <HStack className="items-center gap-4 space-x-0">
      <NetworkSwitcher />
      <DetailsSwitcher />
      {chatEnabled && <ChatSwitcher />}
    </HStack>
  );
}
