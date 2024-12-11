import { test, expect } from '@playwright/test';
import '../mock-rpc-call.ts';
import '../mock-vpn-check.ts';
import { setErc20Balance } from '../utils/setBalance.ts';
import { usdsAddress } from '@jetstreamgg/hooks';
import { TENDERLY_CHAIN_ID } from '@/data/wagmi/config/testTenderlyChain.ts';
import { interceptAndRejectTransactions } from '../utils/rejectTransaction.ts';
import { connectMockWalletAndAcceptTerms } from '../utils/connectMockWalletAndAcceptTerms.ts';

test.beforeAll(async () => {
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '100');
});

test('if not connected it should show a connect button', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Savings' }).click();

  // Connect button should be visible
  // TODO: fix this after we update "Sky features" in helipad
  const widgetConnectButton = page.getByText('Set up access to exploreSky Protocol featuresConnect Wallet');
  await expect(widgetConnectButton).toHaveCount(1);
  expect((await widgetConnectButton.allInnerTexts())[0]).toContain('Connect Wallet');

  // After connecting, the button should disappear
  await connectMockWalletAndAcceptTerms(page);
  await expect(widgetConnectButton).not.toBeVisible();
});

test('percentage buttons work', async ({ page }) => {
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '100');
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();

  await page.getByRole('button', { name: '25%' }).click();
  expect(await page.getByTestId('supply-input-savings').inputValue()).toBe('25');
  await page.getByRole('button', { name: '50%' }).click();
  expect(await page.getByTestId('supply-input-savings').inputValue()).toBe('50');
  await page.getByRole('button', { name: '100%' }).click();
  expect(await page.getByTestId('supply-input-savings').inputValue()).toBe('100');

  await page.getByRole('tab', { name: 'Withdraw' }).click();
  const suppliedBalancedText = await page.getByTestId('withdraw-input-savings-balance').innerText();
  const withdrawBalance = parseFloat(suppliedBalancedText.replace('USDS', '').trim());

  await page.getByRole('button', { name: '25%' }).click();
  const input25 = (await page.getByTestId('withdraw-input-savings').inputValue()).replace('USDS', '').trim();
  const val25 = parseFloat(input25);
  expect(val25).toBeGreaterThanOrEqual(withdrawBalance * 0.25);
  expect(val25).toBeLessThanOrEqual(withdrawBalance * 0.25 + 0.1);

  await page.getByRole('button', { name: '50%' }).click();
  const input50 = (await page.getByTestId('withdraw-input-savings').inputValue()).replace('USDS', '').trim();
  const val50 = parseFloat(input50);
  expect(val50).toBeGreaterThanOrEqual(withdrawBalance * 0.5);
  expect(val50).toBeLessThanOrEqual(withdrawBalance * 0.5 + 0.1);

  await page.getByRole('button', { name: '100%' }).click();
  const input100 = (await page.getByTestId('withdraw-input-savings').inputValue()).replace('USDS', '').trim();
  const val100 = parseFloat(input100);
  expect(val100).toBeGreaterThanOrEqual(withdrawBalance);
});

test('enter amount button should be disabled', async ({ page }) => {
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();

  await expect(
    page.getByTestId('widget-container').locator('button').filter({ hasText: 'Enter amount' })
  ).toBeDisabled();

  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').fill('0');

  await expect(
    page.getByTestId('widget-container').locator('button').filter({ hasText: 'Enter amount' })
  ).toBeDisabled();

  // Withdraw
  await page.getByRole('tab', { name: 'Withdraw' }).click();
  await expect(
    page.getByTestId('widget-container').locator('button').filter({ hasText: 'Enter amount' })
  ).toBeDisabled();
  await page.getByTestId('withdraw-input-savings').click();
  await page.getByTestId('withdraw-input-savings').fill('0');
  // TODO: Fix this in widgets package
  await expect(
    page.getByTestId('widget-container').locator('button').filter({ hasText: 'Enter amount' })
  ).toBeDisabled();
});

test('An approval error redirects to the error screen', async ({ page }) => {
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '101');
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();
  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').fill('101');

  // Intercept the tenderly RPC call to reject the transaction. Waits for 200ms for UI to update
  await interceptAndRejectTransactions(page, 200, true);
  await page.getByRole('button', { name: 'Approve' }).click();

  expect(
    page.getByText('An error occurred when allowing this app to access the USDS in your wallet.')
  ).toBeVisible();
  expect(page.getByRole('button', { name: 'Back' }).last()).toBeVisible();
  expect(page.getByRole('button', { name: 'Back' }).last()).toBeEnabled();
  expect(page.getByRole('button', { name: 'Retry' }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' }).last()).toBeEnabled({ timeout: 15000 });

  await page.getByRole('button', { name: 'Retry' }).last().click();

  await expect(
    page.getByText('An error occurred when allowing this app to access the USDS in your wallet.')
  ).toBeVisible();
});
