import { http } from 'viem';
import { createConfig } from 'wagmi';
import { getTestTenderlyChain } from './testTenderlyChain';
import { mock } from 'wagmi/connectors';

const tenderlyTestChain = getTestTenderlyChain();

//this address is able to send transactions on the tenderly vnet via the wagmi mock
const TEST_WALLET_ADDRESS = '0xFebC63589D8a3bc5CD97E86C174A836c9caa6DEe';

export const mockWagmiConfig = createConfig({
  chains: [tenderlyTestChain],
  connectors: [
    mock({
      accounts: [TEST_WALLET_ADDRESS],
      features: {
        reconnect: true
      }
    })
  ],
  transports: {
    [tenderlyTestChain.id]: http()
  }
});
