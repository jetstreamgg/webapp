import { sepolia, mainnet } from 'wagmi/chains';
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
  ETH_ADDRESS
} from '@jetstreamgg/hooks';
import { tenderly } from '@/data/wagmi/config/config.default';
import { TENDERLY_CHAIN_ID } from '@/data/wagmi/config/testTenderlyChain';

const { usdc, usdt, eth, weth, dai, usds } = TOKENS;

// TODO Add remaining mainnet tokens once they have been deployed
export const restrictedTokenList = {
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
  ]
};
