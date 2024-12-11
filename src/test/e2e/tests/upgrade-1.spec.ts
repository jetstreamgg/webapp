import { expect, test } from '@playwright/test';
import '../mock-rpc-call.ts';
import '../mock-vpn-check.ts';
import { setErc20Balance } from '../utils/setBalance.ts';
import { mcdDaiAddress, mkrAddress, usdsAddress } from '@jetstreamgg/hooks';
import { TENDERLY_CHAIN_ID } from '@/data/wagmi/config/testTenderlyChain.ts';
import { approveOrPerformAction } from '../utils/approveOrPerformAction.ts';
import { connectMockWalletAndAcceptTerms } from '../utils/connectMockWalletAndAcceptTerms.ts';

test.beforeAll(async () => {
  await setErc20Balance(mcdDaiAddress[TENDERLY_CHAIN_ID], '10');
  await setErc20Balance(mkrAddress[TENDERLY_CHAIN_ID], '10');
});

test('Upgrade DAI and revert USDS', async ({ page }) => {
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Upgrade' }).click();

  await expect(page.getByRole('button', { name: 'Transaction overview' })).not.toBeVisible();

  await page.getByTestId('upgrade-input-origin').click();
  await page.getByTestId('upgrade-input-origin').fill('4');
  await expect(page.getByRole('button', { name: 'Transaction overview' })).toBeVisible();
  await approveOrPerformAction(page, 'Upgrade');
  await page.getByRole('button', { name: 'Back to Upgrade' }).click();
  await page.getByRole('tab', { name: 'Revert' }).click();
  await expect(page.getByRole('button', { name: 'Transaction overview' })).not.toBeVisible();
  await page.getByTestId('upgrade-input-origin').click();
  await page.getByTestId('upgrade-input-origin').fill('4');
  await expect(page.getByRole('button', { name: 'Transaction overview' })).toBeVisible();
  await approveOrPerformAction(page, 'Revert');
  await page.getByRole('button', { name: 'Back to Upgrade' }).click();
});

test('Upgrade MKR and revert SKY', async ({ page }) => {
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Upgrade' }).click();
  await page.getByTestId('undefined-menu-button').click();
  await page.getByRole('button', { name: 'MKR MKR MKR' }).click();

  await expect(page.getByRole('button', { name: 'Transaction overview' })).not.toBeVisible();

  await page.getByTestId('upgrade-input-origin').click();
  await page.getByTestId('upgrade-input-origin').fill('4');
  await expect(page.getByRole('button', { name: 'Transaction overview' })).not.toBeVisible();
  await approveOrPerformAction(page, 'Upgrade');
  await page.getByRole('button', { name: 'Back to Upgrade' }).click();
  await page.getByRole('tab', { name: 'Revert' }).click();
  await page.getByTestId('undefined-menu-button').click();
  await page.getByRole('button', { name: 'SKY SKY SKY' }).click();
  await expect(page.getByRole('button', { name: 'Transaction overview' })).not.toBeVisible();
  await page.getByTestId('upgrade-input-origin').click();
  await page.getByTestId('upgrade-input-origin').fill((4 * 24000).toString());
  await expect(page.getByRole('button', { name: 'Transaction overview' })).not.toBeVisible();
  await approveOrPerformAction(page, 'Revert');
  await page.getByRole('button', { name: 'Back to Upgrade' }).click();
});

test('Upgrade and revert with insufficient balance', async ({ page }) => {
  await setErc20Balance(mcdDaiAddress[TENDERLY_CHAIN_ID], '100');
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '100');

  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Upgrade' }).click();

  await expect(page.getByTestId('upgrade-input-origin-balance')).not.toHaveText('No wallet connected');
  const daiBalanceLabel = page.getByTestId('upgrade-input-origin-balance');
  const daiBalanceText = ((await daiBalanceLabel.innerText()) as string).split(' ')[0].trim();

  await page.getByTestId('upgrade-input-origin').click();
  // Upgrade an amount greater than the balance
  await page.getByTestId('upgrade-input-origin').fill(`${daiBalanceText}0`);
  await expect(page.getByText('Insufficient funds')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve' })).toBeDisabled();

  await page.getByRole('tab', { name: 'Revert' }).click();
  await expect(page.getByTestId('upgrade-input-origin-balance')).not.toHaveText('No wallet connected');
  const uSDSBalanceLabel = page.getByTestId('upgrade-input-origin-balance');
  const uSDSBalanceText = ((await uSDSBalanceLabel.innerText()) as string).split(' ')[0].trim();

  await page.getByTestId('upgrade-input-origin').click();
  // Upgrade an amount greater than the balance
  await page.getByTestId('upgrade-input-origin').fill(`${uSDSBalanceText}0`);
  await expect(page.getByText('Insufficient funds')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve' })).toBeDisabled();
});
