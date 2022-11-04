require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

task('accounts', 'Prints the list of accounts', async() => {
  const accounts = await ethers.getSigner();

  for (const account of accounts) {
    console.log(`accounts is ${account.address}`);
  }
});

function mnemonic() {
  console.log(process.env.PRIVATE_KEY);
  return process.env.PRIVATE_KEY;
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.0',
  networks: {
    // hardhat 内置测试网络（选填
    localhost: {
      url: "http://localhost:8545",
    },
    sepolia: {
      url: 'https://sepolia.infura.io/v3/' + process.env.INFURA_ID, //<---- CONFIG YOUR INFURA ID IN .ENV! (or it won't work)
      accounts: [mnemonic()],
    },
  },
};
