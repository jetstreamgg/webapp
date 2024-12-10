import { waitForVnetsReady } from './utils/waitForVnetsReady';

const globalSetup = async (): Promise<void> => {
  await waitForVnetsReady();
};

export default globalSetup;
