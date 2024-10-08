import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import {
  safeWallet,
  rainbowWallet,
  walletConnectWallet,
  metaMaskWallet,
  coinbaseWallet,
  injectedWallet
} from '@rainbow-me/rainbowkit/wallets';
import { TENDERLY_CHAIN_ID, TENDERLY_RPC_URL } from './testTenderlyChain';

export const tenderly = {
  id: TENDERLY_CHAIN_ID,
  name: 'mainnet_sep_30_0',
  network: 'tenderly',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH'
  },
  rpcUrls: {
    public: { http: [TENDERLY_RPC_URL] },
    default: { http: [TENDERLY_RPC_URL] }
  },
  blockExplorers: {
    default: { name: '', url: '' }
  }
};

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Suggested',
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        walletConnectWallet,
        rainbowWallet,
        safeWallet,
        injectedWallet
      ]
    }
  ],
  {
    appName: 'sky.money',
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'd5c6af7c0680adbaad12f33744ee4413'
  }
);

export const wagmiConfigDev = createConfig({
  chains: [mainnet, tenderly, sepolia],
  connectors,
  transports: {
    [mainnet.id]: http(import.meta.env.VITE_RPC_PROVIDER_MAINNET || ''),
    [tenderly.id]: http(import.meta.env.VITE_RPC_PROVIDER_TENDERLY || ''),
    [sepolia.id]: http(import.meta.env.VITE_RPC_PROVIDER_SEPOLIA || '')
  }
});

//TODO: use this for production
export const wagmiConfigMainnet = createConfig({
  chains: [mainnet],
  connectors,
  transports: {
    [mainnet.id]: http(import.meta.env.VITE_RPC_PROVIDER_MAINNET || '')
  }
});
