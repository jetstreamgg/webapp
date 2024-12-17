import { sepolia, mainnet, base } from 'wagmi/chains';
import {
  usdcAddress,
  usdcSepoliaAddress,
  usdtAddress,
  usdtSepoliaAddress,
  TOKENS,
  wethAddress,
  mcdDaiAddress,
  wethSepoliaAddress,
  mcdDaiSepoliaAddress,
  usdsAddress,
  ETH_ADDRESS,
  mkrAddress,
  skyAddress,
  usdcBaseAddress,
  usdsBaseAddress
} from '@jetstreamgg/hooks';
import { tenderly, tenderlyBase } from '@/data/wagmi/config/config.default';
import { TENDERLY_CHAIN_ID, TENDERLY_BASE_CHAIN_ID } from '@/data/wagmi/config/testTenderlyChain';

const { usdc, usdt, eth, weth, dai, usds, mkr, sky } = TOKENS;

export const restrictedTokenList = {
  [mainnet.id]: [
    { ...usdc, address: usdcAddress[mainnet.id] },
    { ...usdt, address: usdtAddress[mainnet.id] },
    { ...eth, address: eth.address[mainnet.id] },
    { ...weth, address: wethAddress[mainnet.id] },
    { ...dai, address: mcdDaiAddress[mainnet.id] },
    { ...usds, address: usdsAddress[mainnet.id] },
    { ...mkr, address: mkrAddress[mainnet.id] },
    { ...sky, address: skyAddress[mainnet.id] }
  ],
  [tenderly.id]: [
    { ...usdc, address: usdcAddress[TENDERLY_CHAIN_ID] },
    { ...usdt, address: usdtAddress[TENDERLY_CHAIN_ID] },
    { ...eth, address: eth.address[TENDERLY_CHAIN_ID] },
    { ...weth, address: wethAddress[TENDERLY_CHAIN_ID] },
    { ...dai, address: mcdDaiAddress[TENDERLY_CHAIN_ID] },
    { ...usds, address: usdsAddress[TENDERLY_CHAIN_ID] },
    { ...mkr, address: mkrAddress[TENDERLY_CHAIN_ID] },
    { ...sky, address: skyAddress[TENDERLY_CHAIN_ID] }
  ],
  // ]
  [sepolia.id]: [
    // The USDC token that COW uses has 18 decimals, instead of 6
    { ...usdc, address: usdcSepoliaAddress[sepolia.id], decimals: 18 },
    { ...usdt, address: usdtSepoliaAddress[sepolia.id] },
    { ...eth, address: ETH_ADDRESS },
    { ...weth, address: wethSepoliaAddress[sepolia.id] },
    { ...dai, address: mcdDaiSepoliaAddress[sepolia.id] }
  ],
  [base.id]: [
    { ...usdc, address: usdcBaseAddress[base.id] },
    { ...usds, address: usdsBaseAddress[base.id] }
  ],
  [tenderlyBase.id]: [
    { ...usdc, address: usdcBaseAddress[TENDERLY_BASE_CHAIN_ID] },
    { ...usds, address: usdsBaseAddress[TENDERLY_BASE_CHAIN_ID] }
  ]
};

export const restrictedTokenListTrade = {
  [mainnet.id]: [
    { ...usdc, address: usdcAddress[mainnet.id] },
    { ...usdt, address: usdtAddress[mainnet.id] },
    { ...eth, address: eth.address[mainnet.id] },
    { ...weth, address: wethAddress[mainnet.id] },
    { ...dai, address: mcdDaiAddress[mainnet.id] },
    { ...usds, address: usdsAddress[mainnet.id] }
  ],
  [tenderly.id]: [
    { ...usdc, address: usdcAddress[TENDERLY_CHAIN_ID] },
    { ...usdt, address: usdtAddress[TENDERLY_CHAIN_ID] },
    { ...eth, address: eth.address[TENDERLY_CHAIN_ID] },
    { ...weth, address: wethAddress[TENDERLY_CHAIN_ID] },
    { ...dai, address: mcdDaiAddress[TENDERLY_CHAIN_ID] },
    { ...usds, address: usdsAddress[TENDERLY_CHAIN_ID] }
  ],
  // ]
  [sepolia.id]: [
    // The USDC token that COW uses has 18 decimals, instead of 6
    { ...usdc, address: usdcSepoliaAddress[sepolia.id], decimals: 18 },
    { ...usdt, address: usdtSepoliaAddress[sepolia.id] },
    { ...eth, address: ETH_ADDRESS },
    { ...weth, address: wethSepoliaAddress[sepolia.id] },
    { ...dai, address: mcdDaiSepoliaAddress[sepolia.id] }
  ],
  [base.id]: [
    { ...usdc, address: usdcBaseAddress[base.id] },
    { ...usds, address: usdsBaseAddress[base.id] }
  ],
  [tenderlyBase.id]: [
    { ...usdc, address: usdcBaseAddress[TENDERLY_BASE_CHAIN_ID] },
    { ...usds, address: usdsBaseAddress[TENDERLY_BASE_CHAIN_ID] }
  ]
};
