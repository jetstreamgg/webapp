import { type Page } from '@playwright/test';

export const switchToBase = async (page: Page) => {
  //open network switcher from widget button
  await page.getByTestId('chain-modal-trigger-widget').click();
  //close widget button
  await page.getByTestId('chain-modal-close').click();
  //open network switcher from header button
  await page.getByTestId('chain-modal-trigger-header').click();
  //select base
  await page.getByRole('button', { name: 'Tenderly Base' }).click();
};
