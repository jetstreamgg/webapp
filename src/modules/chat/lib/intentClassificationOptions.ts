export const TRADE_ACTION = 'TRADE_ACTION';
export const REWARDS_ACTION = 'REWARDS_ACTION';
export const UPGRADE_ACTION = 'UPGRADE_ACTION';
export const SAVINGS_ACTION = 'SAVINGS_ACTION';

export const actionIntentClassificationOptions = [
  {
    name: TRADE_ACTION,
    description:
      'The user wants to perform a cryptocurrency trade from one currency to another. This might look like "trade <currency> to <currency>" or "I want to trade <currency> to <currency>".'
  },
  {
    name: REWARDS_ACTION,
    description: 'The user wants to earn rewards by using one token to get another token as a reward.'
  },
  {
    name: UPGRADE_ACTION,
    description:
      'The user wants to upgrade their cryptocurrency, such as converting DAI to USDS or MKR to SKY.'
  },
  {
    name: SAVINGS_ACTION,
    description:
      'The user wants to supply their USDS to the Sky Savings Rate module to receive sUSDS tokens and accumulate USDS through the Sky Savings Rate.'
  }
];
