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

test('Balance changes after a successful withdraw', async ({ page }) => {
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '10');

  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();

  // Supply some USDS
  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').fill('2');
  await approveOrPerformAction(page, 'Supply');
  await page.getByRole('button', { name: 'Back to Savings' }).click();

  // Withdraw
  await page.getByRole('tab', { name: 'Withdraw' }).click();

  const suppliedBalancedText = await page.getByTestId('supplied-balance').innerText();
  const prewithdrawBalance = parseFloat(suppliedBalancedText.replace('USDS', '').trim());

  await page.getByTestId('withdraw-input-savings').click();
  await page.getByTestId('withdraw-input-savings').fill('2');
  const withdrawButton = await page
    .waitForSelector('role=button[name="Withdraw"]', { timeout: 500 })
    .catch(() => null);
  if (withdrawButton) {
    await withdrawButton.click();
  }
  await page.getByRole('button', { name: 'Back to Savings' }).click();

  const expectedBalance = prewithdrawBalance - 2;
  if (expectedBalance >= 1) {
    // initial supply was 2, we supplied 2 more, then withdrew 2
    await expect(page.getByTestId('supplied-balance')).toHaveText('2 USDS', { timeout: 15000 });
  } else {
    const zeroBalance = Number(
      (await page.getByTestId('supplied-balance').innerText()).split(' ')[0].replace('<', '').trim()
    );
    expect(zeroBalance).toBeLessThan(1);
  }
});

test('supply with enough allowance does not require approval', async ({ page }) => {
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '100');
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();
  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').fill('100');
  // Approve
  await page.getByRole('button', { name: 'Approve' }).click();
  // await page.locator('role=button[name="Back"]').first().click(); //for some reason there's another button named Next
  // await page.getByRole('button', { name: 'Finish' }).click();

  // Restart
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();
  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').fill('100');
  // It should not ask for approval
  await expect(page.getByRole('button', { name: 'Supply' })).toBeVisible();

  // Supply and reset approval
  await page.getByRole('button', { name: 'Supply' }).click();
});

test('supply without allowance requires approval', async ({ page }) => {
  await setErc20Balance(usdsAddress[TENDERLY_CHAIN_ID], '101');
  await page.goto('/');
  await connectMockWalletAndAcceptTerms(page);
  await page.getByRole('tab', { name: 'Savings' }).click();
  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').click();
  await page.getByTestId('supply-input-savings').fill('101');
  // Approve button should be visible
  await expect(page.getByRole('button', { name: 'Approve' })).toBeVisible();
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
