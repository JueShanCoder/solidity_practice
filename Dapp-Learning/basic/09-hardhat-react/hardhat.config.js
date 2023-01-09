require('@nomiclabs/hardhat-waffle');
require('./tasks/faucet');
require('dotenv').config();

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
    goerli: {
      url: 'https://goerli.infura.io/v3/' + process.env.INFURA_ID, //<---- YOUR INFURA ID! (or it won't work)
      accounts: [mnemonic()],
    },
  },
};
