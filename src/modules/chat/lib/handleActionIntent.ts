import { TRADE_ACTION, REWARDS_ACTION, UPGRADE_ACTION, SAVINGS_ACTION } from './intentClassificationOptions';
import { ChatIntent, Slot } from '../types/Chat';
import { generateRewardIntents } from './generateRewardIntents';
import { generateSavingsIntents } from './generateSavingsIntents';
import { generateTradeIntents } from './generateTradeIntents';
import { generateUpgradeIntents } from './generateUpgradeIntents';
import { RewardContract } from '@jetstreamgg/hooks';

export const handleActionIntent = ({
  classification,
  slots,
  rewards
}: {
  classification: string;
  slots: Slot[];
  rewards?: RewardContract[];
}): ChatIntent[] => {
  switch (classification) {
    case TRADE_ACTION:
      return generateTradeIntents(slots);
    case REWARDS_ACTION:
      return generateRewardIntents(slots, rewards);
    case UPGRADE_ACTION:
      return generateUpgradeIntents(slots);
    case SAVINGS_ACTION:
      return generateSavingsIntents(slots);
    default:
      return [];
  }
};
