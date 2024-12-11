import test, { expect } from '@playwright/test';
import { setErc20Balance } from '../utils/setBalance';
import { connectMockWalletAndAcceptTerms } from '../utils/connectMockWalletAndAcceptTerms';
import { mcdDaiAddress, mkrAddress, usdsAddress } from '@jetstreamgg/hooks';
import { TENDERLY_CHAIN_ID } from '@/data/wagmi/config/testTenderlyChain';
import { interceptAndRejectTransactions } from '../utils/rejectTransaction';
import '../mock-rpc-call.ts';
import '../mock-vpn-check.ts';

test.beforeAll(async () => {
  await setErc20Balance(mcdDaiAddress[TENDERLY_CHAIN_ID], '10');
  await setErc20Balance(mkrAddress[TENDERLY_CHAIN_ID], '10');
});

// TODO: this test occasionally fails due to wallet not being connect, which might be related to above test
test('percentage buttons work', async ({ page }) => {
  await setErc20Balance(mcdDaiAddress[TENDERLY_CHAIN_ID], '100');
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '1000');

  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Upgrade' }).click();

  await page.getByRole('button', { name: '25%' }).click();
  expect(await page.getByTestId('upgrade-input-origin').inputValue()).toBe('25');
  await page.getByRole('button', { name: '50%' }).click();
  expect(await page.getByTestId('upgrade-input-origin').inputValue()).toBe('50');
  await page.getByRole('button', { name: '100%' }).click();
  expect(await page.getByTestId('upgrade-input-origin').inputValue()).toBe('100');

  await page.getByRole('tab', { name: 'Revert' }).click();
  await page.getByRole('button', { name: '25%' }).click();
  expect(await page.getByTestId('upgrade-input-origin').inputValue()).toBe('250');
  await page.getByRole('button', { name: '50%' }).click();
  expect(await page.getByTestId('upgrade-input-origin').inputValue()).toBe('500');
  await page.getByRole('button', { name: '100%' }).click();
  expect(await page.getByTestId('upgrade-input-origin').inputValue()).toBe('1000');
});

test('enter amount button should be disabled', async ({ page }) => {
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Upgrade' }).click();

  await expect(
    page.getByTestId('widget-container').locator('button').filter({ hasText: 'Enter amount' })
  ).toBeDisabled();

  await page.getByTestId('upgrade-input-origin').click();
  await page.getByTestId('upgrade-input-origin').fill('0');

  await expect(
    page.getByTestId('widget-container').locator('button').filter({ hasText: 'Enter amount' })
  ).toBeDisabled();

  // Revert
  await page.getByRole('tab', { name: 'Revert' }).click();
  await expect(
    page.getByTestId('widget-container').locator('button').filter({ hasText: 'Enter amount' })
  ).toBeDisabled();
  await page.getByTestId('upgrade-input-origin').click();
  await page.getByTestId('upgrade-input-origin').fill('0');
  // TODO: Fix this in widgets package
  await expect(
    page.getByTestId('widget-container').locator('button').filter({ hasText: 'Enter amount' })
  ).toBeDisabled();
});

test('An approval error redirects to the error screen', async ({ page }) => {
  await setErc20Balance(mcdDaiAddress[TENDERLY_CHAIN_ID], '100');
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '100');
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Upgrade' }).click();
  await page.getByTestId('upgrade-input-origin').click();
  await page.getByTestId('upgrade-input-origin').fill('100');

  // Intercept the tenderly RPC call to reject the transaction. Waits for 200ms for UI to update
  await interceptAndRejectTransactions(page, 200, true);
  await page.getByRole('button', { name: 'Approve' }).click();

  expect(page.getByText('An error occurred ')).toBeVisible();
  expect(page.getByRole('button', { name: 'Back' }).last()).toBeVisible();
  expect(page.getByRole('button', { name: 'Back' }).last()).toBeEnabled();
  expect(page.getByRole('button', { name: 'Retry' }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' }).last()).toBeEnabled({ timeout: 15000 });

  await page.getByRole('button', { name: 'Retry' }).last().click();

  await expect(page.getByText('An error occurred while approving access to your DAI.')).toBeVisible();

  page.getByRole('button', { name: 'Back' }).last().click();
  await page.getByRole('tab', { name: 'Revert' }).click();
  await page.getByTestId('upgrade-input-origin').click();
  await page.getByTestId('upgrade-input-origin').fill('100');

  await page.getByRole('button', { name: 'Approve' }).click();

  expect(page.getByText('An error occurred while approving access to your USDS.')).toBeVisible();
  expect(page.getByRole('button', { name: 'Back' }).last()).toBeVisible();
  expect(page.getByRole('button', { name: 'Back' }).last()).toBeEnabled();
  expect(page.getByRole('button', { name: 'Retry' }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' }).last()).toBeEnabled({ timeout: 15000 });

  await page.getByRole('button', { name: 'Retry' }).last().click();

  await expect(page.getByText('An error occurred while approving access to your USDS.')).toBeVisible();
});
