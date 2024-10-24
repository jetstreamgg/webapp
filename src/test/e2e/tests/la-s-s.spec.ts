import { expect, test } from '@playwright/test';
import '../mock-rpc-call.ts';
import '../mock-vpn-check.ts';
import { approveOrPerformAction } from '../utils/approveOrPerformAction.ts';
import { setErc20Balance } from '../utils/setBalance.ts';
import { usdcAddress } from '@jetstreamgg/hooks';
import { TENDERLY_CHAIN_ID } from '@/data/wagmi/config/testTenderlyChain.ts';
import { connectMockWalletAndAcceptTerms } from '../utils/connectMockWalletAndAcceptTerms.ts';

test.skip('Linked Action - Trade USDC then supply to Savings', async ({ page }) => {
  await setErc20Balance(usdcAddress[TENDERLY_CHAIN_ID], '10', 6);
  await page.goto('?widget=trade&source_token=USDC&target_token=USDS&input_amount=10&linked_action=savings');
  await connectMockWalletAndAcceptTerms(page);

  const arrowStepIndicators = page.locator('[data-testid="arrow-step-indicator"]');
  await expect(arrowStepIndicators).toHaveCount(2);

  await page.getByRole('button', { name: 'Review trade' }).click();
  await page.getByRole('button', { name: 'Approve' }).first().click();
  await expect(page.getByRole('heading', { name: 'Success' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).last().click();
  await expect(page.getByRole('heading', { name: 'Trade completed' })).toBeVisible();

  await page.getByRole('button', { name: 'Add USDS to wallet' }).click();

  await page.getByRole('button', { name: 'Go to Savings' }).click();

  await approveOrPerformAction(page, 'Supply'); //for some reason this was reading the approve button as saying Supply

  await page.getByRole('button', { name: 'Finish' }).click();
});
