import { RewardsModule, Savings, Trade, Upgrade, Seal } from '@/modules/icons';
import { Intent } from './enums';
import { msg } from '@lingui/macro';
import { MessageDescriptor } from '@lingui/core';

export enum QueryParams {
  Locale = 'lang',
  Widget = 'widget',
  Details = 'details',
  Reward = 'reward',
  SealUrnIndex = 'urn_index',
  SourceToken = 'source_token',
  TargetToken = 'target_token',
  LinkedAction = 'linked_action',
  InputAmount = 'input_amount',
  Timestamp = 'timestamp'
}

export const restrictedIntents = [Intent.SAVINGS_INTENT, Intent.REWARDS_INTENT, Intent.SEAL_INTENT];

export const IntentMapping = {
  [Intent.BALANCES_INTENT]: 'balances',
  [Intent.UPGRADE_INTENT]: 'upgrade',
  [Intent.TRADE_INTENT]: 'trade',
  [Intent.SAVINGS_INTENT]: 'savings',
  [Intent.REWARDS_INTENT]: 'rewards',
  [Intent.SEAL_INTENT]: 'seal'
};

export const intentTxt: Record<string, MessageDescriptor> = {
  trade: msg`trade`,
  upgrade: msg`upgrade`,
  savings: msg`savings`,
  rewards: msg`rewards`,
  balances: msg`balances`,
  seal: msg`seal`
};

export const VALID_LINKED_ACTIONS = [
  IntentMapping[Intent.REWARDS_INTENT],
  IntentMapping[Intent.SAVINGS_INTENT]
];

const AvailableIntentMapping = Object.entries(IntentMapping).reduce(
  (acc, [key, value]) => {
    const isRestricted = import.meta.env.VITE_RESTRICTED_BUILD === 'true';
    if (!isRestricted || !restrictedIntents.includes(key as Intent)) {
      acc[key as Intent] = value;
    }
    return acc;
  },
  {} as typeof IntentMapping
);

export function mapIntentToQueryParam(intent: Intent): string {
  return AvailableIntentMapping[intent] || '';
}

export function mapQueryParamToIntent(queryParam: string): Intent {
  const intent = Object.keys(AvailableIntentMapping).find(
    key => AvailableIntentMapping[key as keyof typeof AvailableIntentMapping] === queryParam
  );
  return (intent as Intent) || Intent.BALANCES_INTENT;
}

export const REFRESH_DELAY = 1000;

export const linkedActionMetadata = {
  [IntentMapping[Intent.UPGRADE_INTENT]]: { text: 'Upgrade DAI', icon: Upgrade },
  [IntentMapping[Intent.TRADE_INTENT]]: { text: 'Trade Tokens', icon: Trade },
  [IntentMapping[Intent.SAVINGS_INTENT]]: { text: 'Access Savings', icon: Savings },
  [IntentMapping[Intent.REWARDS_INTENT]]: { text: 'Get Rewards', icon: RewardsModule },
  [IntentMapping[Intent.SEAL_INTENT]]: { text: 'Seal', icon: Seal }
};

export const ALLOWED_EXTERNAL_DOMAINS = ['sky.money', 'app.sky.money', 'docs.sky.money'];

export const URL_BA_LABS_API = 'https://info-sky.blockanalitica.com/api/v1';

export const PROD_URL_SKY_SUBGRAPH_MAINNET =
  'https://query-subgraph.sky.money/subgraphs/name/jetstreamgg/subgraph-mainnet';
export const STAGING_URL_SKY_SUBGRAPH_MAINNET =
  'https://query-subgraph-staging.sky.money/subgraphs/name/jetstreamgg/subgraph-mainnet';
export const STAGING_URL_SKY_SUBGRAPH_TESTNET =
  'https://query-subgraph-staging.sky.money/subgraphs/name/jetstreamgg/subgraph-testnet';
