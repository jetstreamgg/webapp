import { test } from '@playwright/test';
import '../mock-rpc-call.ts';
import '../mock-vpn-check.ts';
import { setErc20Balance, setEthBalance } from '../utils/setBalance.ts';
import { usdsBaseAddress } from '@jetstreamgg/hooks';
import { TENDERLY_BASE_CHAIN_ID } from '@/data/wagmi/config/testTenderlyChain.ts';
import { connectMockWalletAndAcceptTerms } from '../utils/connectMockWalletAndAcceptTerms.ts';
import { switchToBase } from '../utils/switchToBase.ts';
import { NetworkName } from '../utils/constants.ts';

test.beforeAll(async () => {
  await setEthBalance('100', NetworkName.base);
  await setErc20Balance(usdsBaseAddress[TENDERLY_BASE_CHAIN_ID], '100', 18, NetworkName.base);
});

test('Go to Base Savings', async ({ page }) => {
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();
  await switchToBase(page);
});
