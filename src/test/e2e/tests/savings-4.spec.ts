import { test, expect } from '@playwright/test';
import '../mock-rpc-call.ts';
import '../mock-vpn-check.ts';
import { setErc20Balance } from '../utils/setBalance.ts';
import { usdsAddress } from '@jetstreamgg/hooks';
import { TENDERLY_CHAIN_ID } from '@/data/wagmi/config/testTenderlyChain.ts';
import { interceptAndRejectTransactions } from '../utils/rejectTransaction.ts';
import { approveOrPerformAction } from '../utils/approveOrPerformAction.ts';
import { connectMockWalletAndAcceptTerms } from '../utils/connectMockWalletAndAcceptTerms.ts';

test.beforeAll(async () => {
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '100');
});

test('A supply error redirects to the error screen', async ({ page }) => {
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '100');
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();
  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').fill('1');

  await approveOrPerformAction(page, 'Supply', { reject: true });

  await expect(page.getByText('An error occurred while supplying your USDS')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back' }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back' }).last()).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Retry' }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' }).last()).toBeEnabled({ timeout: 15000 });

  await page.getByRole('button', { name: 'Retry' }).last().click();

  await expect(page.getByText('An error occurred while supplying your USDS')).toBeVisible();
});

test('A withdraw error redirects to the error screen', async ({ page }) => {
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();
  await page.getByRole('tab', { name: 'Withdraw' }).click();
  await page.getByTestId('withdraw-input-savings').click();
  await page.getByTestId('withdraw-input-savings').fill('1');

  const withdrawButton = await page
    .waitForSelector('role=button[name="Withdraw"]', { timeout: 500 })
    .catch(() => null);

  if (withdrawButton) {
    //already have allowance
    // Intercept the tenderly RPC call to reject the transaction. Waits for 200ms for UI to update

    await interceptAndRejectTransactions(page, 200, true);
    withdrawButton.click();
  }

  expect(page.getByText('An error occurred while withdrawing your USDS')).toBeVisible();
  expect(page.getByRole('button', { name: 'Back' }).last()).toBeVisible();
  expect(page.getByRole('button', { name: 'Back' }).last()).toBeEnabled();
  expect(page.getByRole('button', { name: 'Retry' }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' }).last()).toBeEnabled({ timeout: 15000 });

  await page.getByRole('button', { name: 'Retry' }).last().click();

  await expect(page.getByText('An error occurred while withdrawing your USDS')).toBeVisible();
});

test('Details pane shows right data', async ({ page }) => {
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();

  const balanceWidget = await page.getByTestId('supply-input-savings-balance').innerText();
  const balanceDetails = await page
    .getByTestId('savings-stats-section')
    .getByText('100 USDS', { exact: true })
    .innerText();
  expect(balanceWidget).toEqual(balanceDetails);

  await page.getByRole('tab', { name: 'Withdraw' }).click();
  const widgetSuppliedBalance = await page.getByTestId('supplied-balance').innerText();
  const detailsSuppliedBalance = await page
    .getByTestId('savings-stats-section')
    .getByText('102 USDS', { exact: true })
    .innerText();
  expect(widgetSuppliedBalance).toEqual(detailsSuppliedBalance);

  // close details pane
  await page.getByLabel('Toggle details').click();
  await expect(page.getByTestId('savings-stats-section')).not.toBeVisible();

  // open details pane
  await page.getByLabel('Toggle details').click();
  await expect(page.getByTestId('savings-stats-section')).toBeVisible();

  // Chart is present
  await expect(page.getByTestId('savings-chart')).toBeVisible();

  // History is present
  await expect(page.getByTestId('savings-history')).toBeVisible();
});
