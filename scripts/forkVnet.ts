import { writeFile } from 'fs/promises';

// corresponds to `e2e-testing-sep-30-fork` https://dashboard.tenderly.co/jetstreamgg/jetstream/testnet/9a9cfd7a-09bc-4b7f-8d75-03a0c3027267
const ENDGAME0_CONTAINER_ID = '9a9cfd7a-09bc-4b7f-8d75-03a0c3027267';

const forkVnet = async (displayName: string) => {
  if (!displayName.length) {
    throw new Error('A display name is required for the virtual testnet');
  }
  const res = await fetch(
    'https://api.tenderly.co/api/v1/account/jetstreamgg/project/jetstream/testnet/clone',
    {
      headers: [
        ['accept', 'application/json, text/plain, */*'],
        ['content-type', 'application/json'],
        ['X-Access-Key', `${process.env.TENDERLY_API_KEY}`]
      ],
      method: 'POST',
      body: JSON.stringify({
        srcContainerId: ENDGAME0_CONTAINER_ID,
        dstContainerDisplayName: displayName
      })
    }
  );

  // Wait a few seconds to let the vnet clone operation complete
  await new Promise(resolve => setTimeout(resolve, 10000));

  const testnetData = await res.json();

  if (res.status !== 200) {
    console.error('There was an error while forking the virtual testnet:', testnetData);
    process.exit(1);
  }

  console.log('Virtual Testnet successfully forked');

  const adminEndpoint = testnetData.connectivityConfig.endpoints.find(
    (x: { description: string }) =>
      (x.description === 'admin endpoint' || x.description === 'unlocked endpoint') as boolean
  );

  if (!adminEndpoint) {
    console.error('The admin endpoint was not found');
    process.exit(1);
  }

  await writeFile(
    './tenderlyTestnetData.json',
    JSON.stringify({
      TENDERLY_TESTNET_ID: testnetData.id,
      TENDERLY_RPC_URL: adminEndpoint.uri
    })
  );
};

const displayName = process.argv[2];
forkVnet(displayName);
