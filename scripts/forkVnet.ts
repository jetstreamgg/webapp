import { writeFile } from 'fs/promises';

// corresponds to `new-e2e-testing-mainnet-sep-30-0-fork` https://dashboard.tenderly.co/jetstreamgg/jetstream/testnet/d043abc9-3d93-40f6-bbb5-b8f28a365a41
const MAINNET_FORK_CONTAINER_ID = 'd043abc9-3d93-40f6-bbb5-b8f28a365a41';
// corresponds to `base_dec_9_jetstream` https://dashboard.tenderly.co/jetstreamgg/jetstream/testnet/d382d976-02a4-4fc2-a9ba-db43a1602719
const BASE_FORK_CONTAINER_ID = 'd382d976-02a4-4fc2-a9ba-db43a1602719';

const forkVnets = async (displayName: string) => {
  if (!displayName.length) {
    throw new Error('A display name is required for the virtual testnet');
  }
  const responses = await Promise.all(
    [MAINNET_FORK_CONTAINER_ID, BASE_FORK_CONTAINER_ID].map(containerId =>
      fetch('https://api.tenderly.co/api/v1/account/jetstreamgg/project/jetstream/testnet/clone', {
        headers: [
          ['accept', 'application/json, text/plain, */*'],
          ['content-type', 'application/json'],
          ['X-Access-Key', `${process.env.TENDERLY_API_KEY}`]
        ],
        method: 'POST',
        body: JSON.stringify({
          srcContainerId: containerId,
          dstContainerDisplayName: displayName
        })
      })
    )
  );

  const testnetsData = await Promise.all(responses.map(response => response.json()));

  for (const res of responses) {
    if (res.status !== 200) {
      console.error('There was an error while forking the virtual testnet:', res.statusText);
      process.exit(1);
    }
  }

  console.log('Virtual Testnet successfully forked');

  const testnetDataToWrite = testnetsData.map(testnetData => {
    const adminEndpoint = testnetData.connectivityConfig.endpoints.find(
      (x: { description: string }) => x.description === 'admin endpoint'
    );

    return {
      TENDERLY_TESTNET_ID: testnetData.id,
      TENDERLY_RPC_URL: adminEndpoint.uri
    };
  });

  await writeFile('./tenderlyTestnetData.json', JSON.stringify(testnetDataToWrite));
};

const displayName = process.argv[2];
forkVnets(displayName);
