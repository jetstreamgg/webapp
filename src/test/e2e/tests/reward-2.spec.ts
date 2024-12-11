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

test('if not connected it should show a connect button', async ({ page }) => {
  await page.reload();

  // Connect button and copy should be visible
  const widgetConnectButton = page
    .getByTestId('widget-container')
    .getByRole('button', { name: 'Connect Wallet' });
  await expect(widgetConnectButton).toBeEnabled();
  await expect(page.getByText('Set up access to exploreSky Protocol features')).toBeVisible();

  // After connecting, the button should disappear
  await connectMockWalletAndAcceptTerms(page);
  await expect(widgetConnectButton).not.toBeVisible();
});

test('percentage buttons update the token input', async ({ page }) => {
  await page.getByRole('button', { name: '25%' }).click();
  expect(await page.getByTestId('supply-input-rewards').inputValue()).toBe('25');
  await page.getByRole('button', { name: '100%' }).click();
  expect(await page.getByTestId('supply-input-rewards').inputValue()).toBe('100');
  await page.getByRole('button', { name: '50%' }).click();
  expect(await page.getByTestId('supply-input-rewards').inputValue()).toBe('50');
  // Supply so we can test the withdraw tab
  await approveOrPerformAction(page, 'Supply');
  await page.getByRole('button', { name: 'Back to Rewards' }).click();

  await page.getByRole('tab', { name: 'Withdraw' }).click();
  await page.getByRole('button', { name: '25%' }).click();
  expect(await page.getByTestId('withdraw-input-rewards').inputValue()).toBe('12.5');
  await page.getByRole('button', { name: '50%' }).click();
  expect(await page.getByTestId('withdraw-input-rewards').inputValue()).toBe('25');
  await page.getByRole('button', { name: '100%' }).click();
  expect(await page.getByTestId('withdraw-input-rewards').inputValue()).toBe('50');

  // Withdraw all to reset balances
  await withdrawAllAndReset(page);
});

test('Enter amount button only gets enabled with a valid amount', async ({ page }) => {
  const widgetButton = page.getByTestId('widget-container').getByRole('button').last();

  // Supply
  await expect(widgetButton).toBeDisabled();
  await page.getByTestId('supply-input-rewards').fill('0');
  await expect(widgetButton).toBeDisabled();
  await page.getByTestId('supply-input-rewards').fill('1');
  await expect(widgetButton).toBeEnabled();

  // Withdraw
  await page.getByRole('tab', { name: 'Withdraw' }).click();
  await expect(widgetButton).toBeDisabled();
  await page.getByTestId('withdraw-input-rewards').fill('0');
  await expect(widgetButton).toBeDisabled();
});
