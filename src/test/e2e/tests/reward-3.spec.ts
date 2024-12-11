import { expect, test } from '@playwright/test';
import '../mock-rpc-call.ts';
import '../mock-vpn-check.ts';
import { approveOrPerformAction } from '../utils/approveOrPerformAction.ts';
import { setErc20Balance } from '../utils/setBalance.ts';
import { usdsAddress } from '@jetstreamgg/hooks';
import { TENDERLY_CHAIN_ID } from '@/data/wagmi/config/testTenderlyChain.ts';
import { withdrawAllAndReset } from '../utils/rewards.ts';
import { connectMockWalletAndAcceptTerms } from '../utils/connectMockWalletAndAcceptTerms.ts';
import { interceptAndRejectTransactions, revertInterception } from '../utils/rejectTransaction.ts';

test.beforeAll(async () => {
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '100');
});

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Rewards' }).click();
  await page.getByText('With: USDS Get: SKY').first().click();
});

test('An approval error redirects to the error screen', async ({ page }) => {
  await page.getByTestId('supply-input-rewards').fill('100');
  await interceptAndRejectTransactions(page, 200, true);
  await page.getByRole('button', { name: 'Approve' }).click();
  await expect(
    page.getByText('An error occurred when giving permissions to access the tokens in your wallet')
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Retry' }).last()).toBeEnabled();
  await page.getByRole('button', { name: 'Retry' }).last().click();
  await expect(
    page.getByText('An error occurred when giving permissions to access the tokens in your wallet')
  ).toBeVisible();
});

test('A supply error redirects to the error screen', async ({ page }) => {
  await page.getByTestId('supply-input-rewards').fill('1');
  await page.getByRole('button', { name: 'Approve' }).click();
  await expect(page.locator('role=button[name="Continue"]').first()).toBeVisible();
  await interceptAndRejectTransactions(page, 200, true);
  await page.locator('role=button[name="Continue"]').first().click();
  await expect(page.getByText('An error occurred while supplying')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Retry' }).last()).toBeEnabled();
  await page.getByRole('button', { name: 'Retry' }).last().click();
  await expect(page.getByText('An error occurred while supplying')).toBeVisible();
});

test('A withdraw error redirects to the error screen', async ({ page }) => {
  // Supply first so we can test withdraw
  await page.getByTestId('supply-input-rewards').fill('1');
  await approveOrPerformAction(page, 'Supply');
  await page.getByRole('button', { name: 'Back to Rewards' }).click();

  await page.getByRole('tab', { name: 'Withdraw' }).click();
  await page.getByTestId('withdraw-input-rewards').fill('1');
  await approveOrPerformAction(page, 'Withdraw', { reject: true });
  await expect(page.getByText('An error occurred while withdrawing USDS')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Retry' }).last()).toBeEnabled();
  await page.getByRole('button', { name: 'Retry' }).last().click();
  await expect(page.getByText('An error occurred while withdrawing USDS')).toBeVisible();
  await revertInterception(page);
  await withdrawAllAndReset(page);
});
