import test, { expect } from '@playwright/test';
import { setErc20Balance } from '../utils/setBalance';
import { connectMockWalletAndAcceptTerms } from '../utils/connectMockWalletAndAcceptTerms';
import { approveOrPerformAction } from '../utils/approveOrPerformAction';
import { mcdDaiAddress, mkrAddress, usdsAddress } from '@jetstreamgg/hooks';
import { TENDERLY_CHAIN_ID } from '@/data/wagmi/config/testTenderlyChain';
import { interceptAndRejectTransactions } from '../utils/rejectTransaction';
import '../mock-rpc-call.ts';
import '../mock-vpn-check.ts';

test.beforeAll(async () => {
  await setErc20Balance(mcdDaiAddress[TENDERLY_CHAIN_ID], '10');
  await setErc20Balance(mkrAddress[TENDERLY_CHAIN_ID], '10');
});

test('An upgrade error redirects to the error screen', async ({ page }) => {
  await setErc20Balance(mcdDaiAddress[TENDERLY_CHAIN_ID], '100');
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Upgrade' }).click();
  await page.getByTestId('upgrade-input-origin').click();
  await page.getByTestId('upgrade-input-origin').fill('1');

  await approveOrPerformAction(page, 'Upgrade', { reject: true });

  await expect(page.getByText('An error occurred while upgrading your tokens')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back' }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back' }).last()).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Retry' }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' }).last()).toBeEnabled({ timeout: 15000 });

  await page.getByRole('button', { name: 'Retry' }).last().click();

  await expect(page.getByText('An error occurred while upgrading your tokens')).toBeVisible();
});

test('A revert error redirects to the error screen', async ({ page }) => {
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '100');
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Upgrade' }).click();
  await page.getByRole('tab', { name: 'Revert' }).click();
  await page.getByTestId('upgrade-input-origin').click();
  await page.getByTestId('upgrade-input-origin').fill('1');

  await interceptAndRejectTransactions(page, 200, true);

  await approveOrPerformAction(page, 'Revert', { buttonName: 'Retry' });
  expect(page.getByText('An error occurred while approving access to your USDS.')).toBeVisible();
  expect(page.getByRole('button', { name: 'Back' }).last()).toBeVisible();
  expect(page.getByRole('button', { name: 'Back' }).last()).toBeEnabled();
  expect(page.getByRole('button', { name: 'Retry' }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' }).last()).toBeEnabled({ timeout: 15000 });

  await page.getByRole('button', { name: 'Retry' }).last().click();

  await expect(page.getByText('An error occurred while approving access to your USDS.')).toBeVisible();
});

test('Details pane shows right data', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Upgrade' }).click();

  expect(page.getByTestId('upgrade-input-origin-balance')).toHaveText('No wallet connected');

  expect(
    page.getByTestId('widget-container').getByRole('button', { name: 'Connect Wallet' }).last()
  ).toBeVisible();
  expect(
    page.getByTestId('widget-container').getByRole('button', { name: 'Connect Wallet' }).last()
  ).toBeEnabled();
  expect(page.getByTestId('connect-wallet-card').getByRole('heading')).toBeVisible();
  // expect(
  //   page.getByTestId('connect-wallet-card').getByRole('heading', { name: 'Set up access to explore' })
  // ).toBeVisible();
  expect(page.getByTestId('connect-wallet-card-button')).toBeVisible();
  // expect(page.getByRole('cell')).toBeVisible();
  // expect(page.getByRole('cell', { name: 'Connect a wallet to view' })).toBeVisible();

  await connectMockWalletAndAcceptTerms(page);

  await expect(page.getByTestId('upgrade-input-origin-balance')).not.toHaveText('No wallet connected');

  // Connect wallet elements should not be visible after connecting
  await expect(
    page.getByTestId('widget-container').getByRole('button', { name: 'Connect Wallet' })
  ).not.toBeVisible();
  await expect(
    page.getByTestId('connect-wallet-card').getByRole('heading', { name: 'Set up access to explore' })
  ).not.toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Please connect your wallet to view your history' })
  ).not.toBeVisible();

  await page.pause();
  const totalDaiUpgradedWidget = await page
    .getByTestId('widget-container')
    .getByRole('heading', { name: 'Total DAI upgraded', exact: true })
    .first()
    .locator('xpath=ancestor::div[1]')
    .getByText(/\d+/)
    .innerText();
  // const totalMkrUpgradedWidget = await page
  //   .getByTestId('widget-container')
  //   .getByRole('heading', { name: 'Total MKR upgraded', exact: true })
  //   .nth(1)
  //   .locator('xpath=ancestor::div[1]')
  //   .getByText(/\d+/)
  //   .innerText();
  const totalDaiUpgradedDetails = await page
    .getByTestId('upgrade-stats-details')
    .getByRole('heading', { name: 'Total DAI upgraded', exact: true })
    .locator('xpath=ancestor::div[1]')
    .getByText(/\d+/)
    .innerText();
  await page
    .getByTestId('upgrade-stats-details')
    .getByRole('heading', { name: 'Total MKR upgraded', exact: true })
    .locator('xpath=ancestor::div[1]')
    .getByText(/\d+/)
    .innerText();

  // TODO: we should run these through the number formatter, but it was throwing an error
  expect(totalDaiUpgradedWidget.slice(0, 2)).toEqual(totalDaiUpgradedDetails.slice(0, 2));
  // expect(totalMkrUpgradedWidget.slice(0, 2)).toEqual(totalMkrUpgradedDetails.slice(0, 2));

  // close details pane
  await page.getByLabel('Toggle details').click();
  await expect(
    page.getByRole('button', { name: 'Your Upgrade/Revert transaction history' })
  ).not.toBeVisible();

  // open details pane
  await page.getByLabel('Toggle details').click();
  await expect(page.getByRole('button', { name: 'Your Upgrade/Revert transaction history' })).toBeVisible();

  // Chart is present
  await expect(page.getByTestId('usds-sky-totals-chart')).toBeVisible();

  // About section is present
  await expect(page.getByRole('button', { name: 'About' })).toBeVisible();

  // FAQ section is present
  await expect(page.getByRole('button', { name: 'FAQ' })).toBeVisible();
});
