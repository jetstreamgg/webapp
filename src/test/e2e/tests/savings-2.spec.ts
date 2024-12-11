import { test, expect } from '@playwright/test';
import '../mock-rpc-call.ts';
import '../mock-vpn-check.ts';
import { setErc20Balance } from '../utils/setBalance.ts';
import { usdsAddress } from '@jetstreamgg/hooks';
import { TENDERLY_CHAIN_ID } from '@/data/wagmi/config/testTenderlyChain.ts';
import { approveOrPerformAction } from '../utils/approveOrPerformAction.ts';
import { connectMockWalletAndAcceptTerms } from '../utils/connectMockWalletAndAcceptTerms.ts';

test.beforeAll(async () => {
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '100');
});

test('Balance changes after a successful withdraw', async ({ page }) => {
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '10');

  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();

  // Supply some USDS
  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').fill('2');
  await approveOrPerformAction(page, 'Supply');
  await page.getByRole('button', { name: 'Back to Savings' }).click();

  // Withdraw
  await page.getByRole('tab', { name: 'Withdraw' }).click();

  const suppliedBalancedText = await page.getByTestId('supplied-balance').innerText();
  const prewithdrawBalance = parseFloat(suppliedBalancedText.replace('USDS', '').trim());

  await page.getByTestId('withdraw-input-savings').click();
  await page.getByTestId('withdraw-input-savings').fill('2');
  const withdrawButton = await page
    .waitForSelector('role=button[name="Withdraw"]', { timeout: 500 })
    .catch(() => null);
  if (withdrawButton) {
    await withdrawButton.click();
  }
  await page.getByRole('button', { name: 'Back to Savings' }).click();

  const expectedBalance = prewithdrawBalance - 2;
  if (expectedBalance >= 1) {
    // initial supply was 2, we supplied 2 more, then withdrew 2
    await expect(page.getByTestId('supplied-balance')).toHaveText('2 USDS', { timeout: 15000 });
  } else {
    const zeroBalance = Number(
      (await page.getByTestId('supplied-balance').innerText()).split(' ')[0].replace('<', '').trim()
    );
    expect(zeroBalance).toBeLessThan(1);
  }
});

test('supply with enough allowance does not require approval', async ({ page }) => {
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '100');
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();
  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').fill('100');
  // Approve
  await page.getByRole('button', { name: 'Approve' }).click();
  // await page.locator('role=button[name="Back"]').first().click(); //for some reason there's another button named Next
  // await page.getByRole('button', { name: 'Finish' }).click();

  // Restart
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();
  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').fill('100');
  // It should not ask for approval
  await expect(page.getByRole('button', { name: 'Supply' })).toBeVisible();

  // Supply and reset approval
  await page.getByRole('button', { name: 'Supply' }).click();
});

test('supply without allowance requires approval', async ({ page }) => {
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '101');
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();
  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').fill('101');
  // Approve button should be visible
  await expect(page.getByRole('button', { name: 'Approve' })).toBeVisible();
});
