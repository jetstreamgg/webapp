import { expect, test } from '@playwright/test';
import '../mock-rpc-call.ts';
import '../mock-vpn-check.ts';
import { approveOrPerformAction } from '../utils/approveOrPerformAction.ts';
import { setErc20Balance } from '../utils/setBalance.ts';
import { mcdDaiAddress } from '@jetstreamgg/hooks';
import { TENDERLY_CHAIN_ID } from '@/data/wagmi/config/testTenderlyChain.ts';
import { connectMockWalletAndAcceptTerms } from '../utils/connectMockWalletAndAcceptTerms.ts';

test('Linked Action - Upgrade DAI then supply to Savings', async ({ page }) => {
  await setErc20Balance(mcdDaiAddress[TENDERLY_CHAIN_ID], '100');
  await page.goto('?widget=upgrade&input_amount=100&linked_action=savings');
  await connectMockWalletAndAcceptTerms(page);

  const arrowStepIndicators = page.locator('[data-testid="arrow-step-indicator"]');
  await expect(arrowStepIndicators).toHaveCount(2);

  await approveOrPerformAction(page, 'Upgrade');

  const gotToSavingsButton = page.getByRole('button', { name: 'Go to Savings' });
  await expect(gotToSavingsButton).toBeEnabled(); //don't click until enabled
  await gotToSavingsButton.click();

  await approveOrPerformAction(page, 'Supply');

  const finishButton = page.getByRole('button', { name: 'Back to Savings' });
  await expect(finishButton).toBeEnabled(); // don't click until enabled
  await finishButton.click();
});
