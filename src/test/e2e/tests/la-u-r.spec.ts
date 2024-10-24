import { expect, test } from '@playwright/test';
import '../mock-rpc-call.ts';
import '../mock-vpn-check.ts';
import { approveOrPerformAction } from '../utils/approveOrPerformAction.ts';
import { setErc20Balance } from '../utils/setBalance.ts';
import { mcdDaiAddress } from '@jetstreamgg/hooks';
import { TENDERLY_CHAIN_ID } from '@/data/wagmi/config/testTenderlyChain.ts';
import { connectMockWalletAndAcceptTerms } from '../utils/connectMockWalletAndAcceptTerms.ts';

const TOKEN_AMOUNT = '100';

test('Linked Action - Upgrade DAI then get reward', async ({ page }) => {
  await setErc20Balance(mcdDaiAddress[TENDERLY_CHAIN_ID], TOKEN_AMOUNT);
  await page.goto(
    '?widget=upgrade&input_amount=100&linked_action=rewards&reward=0x0650CAF159C5A49f711e8169D4336ECB9b950275'
  );
  await connectMockWalletAndAcceptTerms(page);
  const arrowStepIndicators = page.locator('[data-testid="arrow-step-indicator"]');
  await expect(arrowStepIndicators).toHaveCount(2);

  await approveOrPerformAction(page, 'Upgrade');

  await page.getByRole('button', { name: 'Go to Rewards' }).first().click();

  await approveOrPerformAction(page, 'Supply');

  await page.getByRole('button', { name: 'Back to Rewards' }).first().click();
});
