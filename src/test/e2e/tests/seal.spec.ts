import { expect, test } from '@playwright/test';
import '../mock-rpc-call.ts';
import '../mock-vpn-check.ts';
import { approveOrPerformAction } from '../utils/approveOrPerformAction.ts';
import { setErc20Balance } from '../utils/setBalance.ts';
import { mkrAddress } from '@jetstreamgg/hooks';
import { TENDERLY_CHAIN_ID } from '@/data/wagmi/config/testTenderlyChain.ts';
// import { withdrawAllAndReset } from '../utils/rewards.ts';
import { connectMockWalletAndAcceptTerms } from '../utils/connectMockWalletAndAcceptTerms.ts';

test.beforeAll(async () => {
  await setErc20Balance(mkrAddress[TENDERLY_CHAIN_ID], '100');
});

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Seal' }).click();
});

test('Lock MKR, select rewards, select delegate, and open position', async ({ page }) => {
  await expect(page.getByText('About Seal Rewards')).toBeVisible();
  await page.getByRole('checkbox').click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByTestId('supply-first-input-lse-balance')).toHaveText('100 MKR');

  // fill inputs and click next
  await page.getByTestId('supply-first-input-lse').fill('100');
  // TODO: check all the params
  await expect(page.getByTestId('widget-button')).toBeEnabled();
  await page.getByTestId('widget-button').click();

  // select rewards
  await expect(page.getByText('Select token rewards')).toBeVisible();
  await page.getByRole('button', { name: 'USDS' }).click();
  await expect(page.getByTestId('widget-button')).toBeEnabled();
  await page.getByTestId('widget-button').click();

  // select delegate
  await expect(page.getByText('Select delegate')).toBeVisible();
  await page.getByRole('button', { name: '0x278' }).click();
  await expect(page.getByTestId('widget-button')).toBeEnabled();
  await page.getByTestId('widget-button').click();

  // confirm position
  await expect(page.getByText('Confirm position')).toBeVisible();
  await expect(page.getByText('Sealing')).toBeVisible();
  await expect(page.getByText('100 MKR')).toBeVisible();
  await expect(page.getByText('Seal rewards')).toBeVisible();

  await approveOrPerformAction(page, 'Approve seal amount');
  expect(page.getByRole('heading', { name: 'Token access approved' })).toBeVisible();
  await approveOrPerformAction(page, 'Continue');
  expect(page.getByRole('heading', { name: 'Successfully opened your position' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to seal' }).click();
  await expect(page.getByText('Position 1')).toBeVisible();
});
