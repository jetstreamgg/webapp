import test, { expect } from '@playwright/test';
import { setErc20Balance } from '../utils/setBalance';
import { connectMockWalletAndAcceptTerms } from '../utils/connectMockWalletAndAcceptTerms';
import { approveOrPerformAction } from '../utils/approveOrPerformAction';
import { mcdDaiAddress, mkrAddress, usdsAddress } from '@jetstreamgg/hooks';
import { TENDERLY_CHAIN_ID } from '@/data/wagmi/config/testTenderlyChain';
import '../mock-rpc-call.ts';
import '../mock-vpn-check.ts';

test.beforeAll(async () => {
  await setErc20Balance(mcdDaiAddress[TENDERLY_CHAIN_ID], '10');
  await setErc20Balance(mkrAddress[TENDERLY_CHAIN_ID], '10');
});

test('Balances change after successfully upgrading and reverting', async ({ page }) => {
  await setErc20Balance(mcdDaiAddress[TENDERLY_CHAIN_ID], '10');
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '10');

  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Upgrade' }).click();

  await expect(page.getByTestId('upgrade-input-origin-balance')).not.toHaveText('No wallet connected');
  expect(await page.getByTestId('upgrade-input-origin-balance').innerText()).toBe('10 DAI');

  await page.getByRole('tab', { name: 'Revert' }).click();
  await expect(page.getByTestId('upgrade-input-origin-balance')).not.toHaveText('No wallet connected');
  expect(await page.getByTestId('upgrade-input-origin-balance').innerText()).toBe('10 USDS');
  await page.getByRole('tab', { name: 'Upgrade' }).last().click();

  await page.getByTestId('upgrade-input-origin').click();
  await page.getByTestId('upgrade-input-origin').fill('5');

  await approveOrPerformAction(page, 'Upgrade');
  await page.getByRole('button', { name: 'Back to Upgrade' }).click();

  await expect(page.getByTestId('upgrade-input-origin-balance')).not.toHaveText('No wallet connected');
  await expect(page.getByTestId('upgrade-input-origin-balance')).toHaveText('5 DAI');

  await page.getByRole('tab', { name: 'Revert' }).click();
  await expect(page.getByTestId('upgrade-input-origin-balance')).not.toHaveText('No wallet connected');
  await expect(page.getByTestId('upgrade-input-origin-balance')).toHaveText('15 USDS');

  await page.getByTestId('upgrade-input-origin').click();
  await page.getByTestId('upgrade-input-origin').fill('4');
  await approveOrPerformAction(page, 'Revert');
  await page.getByRole('button', { name: 'Back to Upgrade' }).click();

  await expect(page.getByTestId('upgrade-input-origin-balance')).toHaveText('11 USDS');

  await page.getByRole('tab', { name: 'Upgrade' }).last().click();
  await expect(page.getByTestId('upgrade-input-origin-balance')).toHaveText('9 DAI');
});

test('Insufficient token allowance triggers approval flow', async ({ page }) => {
  await setErc20Balance(mcdDaiAddress[TENDERLY_CHAIN_ID], '100');
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Upgrade' }).click();
  await page.getByTestId('upgrade-input-origin').click();
  await page.getByTestId('upgrade-input-origin').fill('90');
  // Not enough allowance, so approve button should be visible
  await expect(page.getByRole('button', { name: 'Approve' })).toBeVisible();
  await page.getByRole('button', { name: 'Approve' }).click();
  await page.getByRole('button', { name: 'Back' }).click();

  // Restart
  await page.reload();
  await connectMockWalletAndAcceptTerms(page);
  await page.getByTestId('upgrade-input-origin').click();
  await page.getByTestId('upgrade-input-origin').fill('90');
  // It should not ask for approval
  await expect(page.getByTestId('widget-container').getByRole('button', { name: 'Upgrade' })).toBeVisible();
  // Upgrade and reset approval
  await page.getByTestId('widget-container').getByRole('button', { name: 'Upgrade' }).click();
  await page.getByRole('button', { name: 'Back to Upgrade' }).click();

  // Restart
  await page.reload();
  await connectMockWalletAndAcceptTerms(page);
  await page.getByTestId('upgrade-input-origin').click();
  await page.getByTestId('upgrade-input-origin').fill('10');
  // Allowance should be reset, so approve button should be visible again
  await expect(page.getByRole('button', { name: 'Approve' })).toBeVisible();
});

test('if not connected it should show a connect button', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Upgrade' }).click();

  // Connect button should be visible
  // TODO: fix this after we update "Sky features" in helipad
  const widgetConnectButton = page.getByText('Set up access to exploreSky Protocol featuresConnect Wallet');
  await expect(widgetConnectButton).toHaveCount(1);
  expect((await widgetConnectButton.allInnerTexts())[0]).toContain('Connect Wallet');

  // After connecting, the button should disappear
  await connectMockWalletAndAcceptTerms(page);
  await expect(widgetConnectButton).not.toBeVisible();
});
