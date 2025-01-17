import { ChatIntent, Slot } from '../types/Chat';
import { IntentMapping, QueryParams } from '@/lib/constants';

export const generateTradeIntents = (slots: Slot[]): ChatIntent[] => {
  const { TRADE_INTENT: TRADE } = IntentMapping;
  const { Widget, InputAmount, SourceToken, TargetToken, Chat } = QueryParams;

  const amountSlot = slots.find(slot => slot.field === 'amount');
  const sourceTokenSlot = slots.find(slot => slot.field === 'source_token');
  const targetTokenSlot = slots.find(slot => slot.field === 'target_token');

  const intents = [];

  if (sourceTokenSlot?.parsed_value && targetTokenSlot?.parsed_value) {
    if (amountSlot && !Number.isNaN(Number(amountSlot.parsed_value))) {
      // TODO validate that the trade pair is supported
      intents.push({
        intent_description: `Trade ${amountSlot.parsed_value} ${sourceTokenSlot.parsed_value} for ${targetTokenSlot.parsed_value}`,
        url: `?${Widget}=${TRADE}&${SourceToken}=${sourceTokenSlot.parsed_value}&${InputAmount}=${amountSlot.parsed_value}&${TargetToken}=${targetTokenSlot.parsed_value}&${Chat}=true`
      });
    } else {
      intents.push({
        intent_description: `Trade ${sourceTokenSlot.parsed_value} for ${targetTokenSlot.parsed_value}`,
        url: `?${Widget}=${TRADE}&${SourceToken}=${sourceTokenSlot.parsed_value}&${TargetToken}=${targetTokenSlot.parsed_value}&${Chat}=true`
      });
    }
  }

  // handle only source token
  if (sourceTokenSlot?.parsed_value && !targetTokenSlot?.parsed_value) {
    if (amountSlot && !Number.isNaN(Number(amountSlot.parsed_value))) {
      intents.push({
        intent_description: `Trade ${amountSlot.parsed_value} ${sourceTokenSlot.parsed_value}`,
        url: `?${Widget}=${TRADE}&${SourceToken}=${sourceTokenSlot.parsed_value}&${InputAmount}=${amountSlot.parsed_value}&${Chat}=true`
      });
    } else {
      intents.push({
        intent_description: `Trade ${sourceTokenSlot.parsed_value}`,
        url: `?${Widget}=${TRADE}&${SourceToken}=${sourceTokenSlot.parsed_value}&${Chat}=true`
      });
    }
  }

  // handle only target token
  if (!sourceTokenSlot?.parsed_value && targetTokenSlot?.parsed_value) {
    intents.push({
      intent_description: `Trade to ${targetTokenSlot.parsed_value}`,
      url: `?${Widget}=${TRADE}&${TargetToken}=${targetTokenSlot.parsed_value}&${Chat}=true`
    });
  }

  intents.push({
    intent_description: 'Go to Trade',
    url: `?${Widget}=${TRADE}&${Chat}=true`
  });

  return intents;
};
