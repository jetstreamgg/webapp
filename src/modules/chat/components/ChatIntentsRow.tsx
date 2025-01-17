import { Button } from '@/components/ui/button';
import { ChatIntent } from '../types/Chat';
import { Link } from 'react-router-dom';
import { Text } from '@/modules/layout/components/Typography';
import { useRetainedQueryParams } from '@/modules/ui/hooks/useRetainedQueryParams';

type ChatIntentsRowProps = {
  intents: ChatIntent[];
  onIntentSelected: (intent: ChatIntent) => void;
};

export const ChatIntentsRow = ({ intents, onIntentSelected }: ChatIntentsRowProps) => {
  return (
    <div>
      <Text className="text-xs italic text-gray-500">Try a suggested action</Text>
      <div className="mt-2 flex flex-wrap gap-2">
        {intents.map((intent, index) => (
          <IntentRow key={index} intent={intent} onIntentSelected={onIntentSelected} />
        ))}
      </div>
    </div>
  );
};

type IntentRowProps = {
  intent: ChatIntent;
  onIntentSelected: (intent: ChatIntent) => void;
};

const IntentRow = ({ intent, onIntentSelected }: IntentRowProps) => {
  const url = useRetainedQueryParams(intent.url);
  return (
    <Link to={url}>
      <Button variant="suggest" onClick={() => onIntentSelected(intent)}>
        {intent.intent_description}
      </Button>
    </Link>
  );
};
