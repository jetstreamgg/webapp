import { expect, test } from '@playwright/test';
import '../mock-rpc-call.ts';
import '../mock-vpn-check.ts';
import { approveOrPerformAction } from '../utils/approveOrPerformAction.ts';
import { setErc20Balance } from '../utils/setBalance.ts';
import { usdsAddress } from '@jetstreamgg/hooks';
import { TENDERLY_CHAIN_ID } from '@/data/wagmi/config/testTenderlyChain.ts';
import { withdrawAllAndReset } from '../utils/rewards.ts';
import { connectMockWalletAndAcceptTerms } from '../utils/connectMockWalletAndAcceptTerms.ts';

test.beforeAll(async () => {
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '100');
});

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Rewards' }).click();
  await page.getByText('With: USDS Get: SKY').first().click();
});

test('Supply and withdraw with insufficient balance', async ({ page }) => {
  // Supply an amount greater than the balance
  await page.getByTestId('supply-input-rewards').fill('101');
  await expect(page.getByText('Insufficient funds')).toBeVisible();

  // Withdraw an amount greater than the supplied balance
  await page.getByRole('tab', { name: 'Withdraw' }).click();
  await page.getByTestId('withdraw-input-rewards').fill('1');
  await expect(page.getByText('Insufficient funds')).toBeVisible();
});

test('Balances change after successfully supplying and withdrawing', async ({ page }) => {
  await expect(page.getByTestId('supply-input-rewards-balance')).toHaveText('100 USDS');
  const rewardsCardSuppliedBalance = page
    .getByTestId('widget-container')
    .getByText('Supplied balance', { exact: true })
    .locator('xpath=ancestor::div[1]')
    .getByText(/^\d.*USDS$/);
  await expect(rewardsCardSuppliedBalance).toHaveText('0 USDS');

  await page.getByTestId('supply-input-rewards').fill('2');

  await expect(page.getByTestId('widget-button')).toBeEnabled();
  await approveOrPerformAction(page, 'Supply');
  await page.getByRole('button', { name: 'Back to Rewards' }).click();
  await expect(page.getByTestId('supply-input-rewards-balance')).toHaveText('98 USDS');
  await expect(rewardsCardSuppliedBalance).toHaveText('2 USDS');

  await page.getByRole('tab', { name: 'Withdraw' }).click();
  await expect(page.getByTestId('withdraw-input-rewards-balance')).toHaveText('2 USDS');
  await page.getByTestId('withdraw-input-rewards').fill('2');

  await approveOrPerformAction(page, 'Withdraw');
  await page.getByRole('button', { name: 'Back to Rewards' }).click();
  await expect(page.getByTestId('withdraw-input-rewards-balance')).toHaveText('0 USDS');
  await expect(rewardsCardSuppliedBalance).toHaveText('0 USDS');

  await page.getByRole('tab', { name: 'Supply', exact: true }).click();
  await expect(page.getByTestId('supply-input-rewards-balance')).toHaveText('100 USDS');
});

test('Insufficient token allowance triggers approval flow', async ({ page }) => {
  await page.getByTestId('supply-input-rewards').fill('90');
  // Not enough allowance, so approve button should be visible
  await expect(page.getByRole('button', { name: 'Approve' })).toBeVisible();
  await page.getByRole('button', { name: 'Approve' }).click();
  await page.getByRole('button', { name: 'Back' }).click();

  // Restart
  await page.reload();
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Rewards' }).click();
  await page.getByText('With: USDS Get: SKY').first().click();

  await page.getByTestId('supply-input-rewards').fill('90');
  // It should not ask for approval
  await expect(page.getByRole('button', { name: 'Supply' }).first()).toBeVisible();
  // Supply and reset approval
  await page.getByTestId('widget-container').getByRole('button', { name: 'Supply' }).first().click(); // The first supply button is the main button
  await page.getByRole('button', { name: 'Back to Rewards' }).click();

  // Restart
  await page.reload();
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Rewards' }).click();
  await page.getByText('With: USDS Get: SKY').first().click();

  await page.getByTestId('supply-input-rewards').fill('10');
  // Allowance should be reset, so approve button should be visible again
  await expect(page.getByRole('button', { name: 'Approve' })).toBeVisible();
  // Withdraw all to reset balances
  await withdrawAllAndReset(page);
});
