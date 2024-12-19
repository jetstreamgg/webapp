import { readFile } from 'fs/promises';

const deleteVnets = async () => {
  const file = await readFile('./tenderlyTestnetData.json', 'utf-8');
  const testnetsData = JSON.parse(file);

  const responses = await Promise.all(
    //@ts-ignore
    testnetsData.map(({ TENDERLY_TESTNET_ID }) =>
      fetch(
        `https://api.tenderly.co/api/v1/account/jetstreamgg/project/jetstream/testnet/container/${TENDERLY_TESTNET_ID}`,
        {
          headers: [['X-Access-Key', `${process.env.TENDERLY_API_KEY}`]],
          method: 'DELETE'
        }
      )
    )
  );

  if (responses.every(res => res.status === 204)) {
    console.log('Virtual Testnets successfully deleted');
  } else {
    console.log('There was an error while deleting the virtual testnets');
  }
};

deleteVnets();
