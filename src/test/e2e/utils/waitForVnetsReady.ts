import { readFile } from 'fs/promises';
import { backOffRetry } from './setBalance';

const waitForVnetsReadyRequest = async () => {
  const file = await readFile('./tenderlyTestnetData.json', 'utf-8');
  const testnetsData = JSON.parse(file);

  // We send an `eth_blockNumber` request to the RPC endpoints to "ping" them
  const responses = await Promise.all(
    testnetsData.map(({ TENDERLY_RPC_URL }: { TENDERLY_RPC_URL: string }) =>
      fetch(TENDERLY_RPC_URL, {
        method: 'POST',
        headers: {
          accept: '*/*',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          method: 'eth_blockNumber',
          params: [],
          id: 42,
          jsonrpc: '2.0'
        })
      })
    )
  );

  // If all of the RPC endpoints respond with status 200, it means they are ready
  if (!responses.every(({ status }: { status: number }) => status === 200)) {
    throw new Error('Virtual testnets are not ready');
  }
};

export const waitForVnetsReady = async () => {
  await backOffRetry(() => waitForVnetsReadyRequest(), 6, 1);
};
