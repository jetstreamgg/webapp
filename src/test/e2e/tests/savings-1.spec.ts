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

test('Supply and withdraw from Savings', async ({ page }) => {
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();

  await expect(page.getByRole('button', { name: 'Transaction overview' })).not.toBeVisible();

  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').fill('.02');
  await expect(page.getByRole('button', { name: 'Transaction overview' })).toBeVisible();
  await approveOrPerformAction(page, 'Supply');
  await page.getByRole('button', { name: 'Back to Savings' }).click();
  await page.getByRole('tab', { name: 'Withdraw' }).click();

  await page.getByTestId('withdraw-input-savings').click();
  // Tx overview should be hidden if the input is 0 or empty
  await page.getByTestId('withdraw-input-savings').fill('0');
  await expect(page.getByRole('button', { name: 'Transaction overview' })).not.toBeVisible();
  await page.getByTestId('withdraw-input-savings').fill('.01');
  await expect(page.getByRole('button', { name: 'Transaction overview' })).toBeVisible();
  // await page.getByRole('button', { name: 'Withdraw' }).click();
  const withdrawButton = page.getByTestId('widget-button');
  await expect(withdrawButton).toHaveText('Withdraw');
  await withdrawButton.click();
  await expect(page.locator("text=You've withdrawn 0.01")).toHaveCount(1);
  //TODO: why is the finish button disabled?
  await page.getByRole('button', { name: 'Back to Savings' }).click();
});

test('supply with insufficient usds balance', async ({ page }) => {
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();

  const balanceLabel = page.getByTestId('supply-input-savings-balance');
  const balanceText = ((await balanceLabel.innerText()) as string).split(' ')[0].trim();
  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').fill(`500${balanceText}`); // Supply an amount greater than the balance
  await expect(page.getByText('Insufficient funds')).toBeVisible();
});

test('withdraw with insufficient savings balance', async ({ page }) => {
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();
  await page.getByRole('tab', { name: 'Withdraw' }).click();

  await page.getByTestId('withdraw-input-savings-max').click();
  const withdrawButton = await page
    .waitForSelector('role=button[name="Withdraw"]', { timeout: 500 })
    .catch(() => null);

  // If there's no withdraw button after clicking 100%, it means we don't any USDS supplied
  if (withdrawButton) {
    await withdrawButton.click();
    await expect(page.locator("text=You've withdrawn 0.01")).toHaveCount(1);
    // await expect(page.locator('text=successfully withdrew')).toHaveCount(2);
    await page.getByRole('button', { name: 'Back to Savings' }).click();
  }

  await page.getByTestId('withdraw-input-savings').click();
  await page.getByTestId('withdraw-input-savings').fill('100');
  await expect(page.getByText('Insufficient funds.')).toBeVisible();
  const withdrawButtonDisabled = page.getByTestId('widget-button');
  expect(withdrawButtonDisabled).toHaveText('Withdraw');
  expect(withdrawButtonDisabled).toBeDisabled();
});

test('Balance changes after a successful supply', async ({ page }) => {
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '10');

  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();
  expect(await page.getByTestId('supply-input-savings-balance').innerText()).toBe('10 USDS');

  const suppliedBalancedText = await page.getByTestId('supplied-balance').innerText();
  const preSupplyBalance = parseFloat(suppliedBalancedText) || 0;

  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').fill('2');
  await approveOrPerformAction(page, 'Supply');
  await page.getByRole('button', { name: 'Back to Savings' }).click();

  await expect(page.getByTestId('supply-input-savings-balance')).toHaveText('8 USDS', { timeout: 15000 });

  const expectedBalance = preSupplyBalance + 2;
  expect(await page.getByTestId('supplied-balance').innerText()).toBe(`${expectedBalance} USDS`);
});
