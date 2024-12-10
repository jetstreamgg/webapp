import { writeFile } from 'fs/promises';

// corresponds to `e2e-testing-sep-30-fork` https://dashboard.tenderly.co/jetstreamgg/jetstream/testnet/9a9cfd7a-09bc-4b7f-8d75-03a0c3027267
const MAINNET_FORK_CONTAINER_ID = '9a9cfd7a-09bc-4b7f-8d75-03a0c3027267';
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

  // Wait a few seconds to let the vnet clone operation complete
  await new Promise(resolve => setTimeout(resolve, 10000));

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
      //@ts-ignore
      x => x.description === 'admin endpoint'
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
