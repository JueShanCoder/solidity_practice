require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider')
const mnemonic = "59ecd607a26a982e1ab8efccbf92e37267e74929ac712c5332caf59728a35bf0";
module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a managed Ganache instance for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */
  networks: {
     development: {
       host: "127.0.0.1",
       port: 9545,
       network_id: "*"
     },
    //  test: {
    //    host: "127.0.0.1",
    //    port: 7545,
    //    network_id: "*"
    //  }
    //},
    ropsten: {
      provider: () =>
          new HDWalletProvider(
              process.env.PRIVATE_KEY,
              'https://ropsten.infura.io/v3/' + process.env.INFURA_ID
          ),
      network_id: '*',
      gas: 3000000,
      gasPrice: 10000000000,
    },
    kovan: {
      provider: () =>
          new HDWalletProvider(
              process.env.PRIVATE_KEY,
              'https://kovan.infura.io/v3/' + process.env.INFURA_ID
          ),
      network_id: '*',
    },
    rinkeby: {
      provider: () =>
          new HDWalletProvider(
              process.env.PRIVATE_KEY,
              'https://rinkeby.infura.io/v3/' + process.env.INFURA_ID
          ),
      network_id: '*',
      gas: 3000000,
      gasPrice: 10000000000,
    },
    sepolia: {
      provider: () =>
          new HDWalletProvider(
              process.env.PRIVATE_KEY,
              'https://sepolia.infura.io/v3/' + process.env.INFURA_ID
          ),
      network_id: '*',
      gas: 6721975,
      gasPrice: 10000000000,
    },
  },


  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.0"
    }
  }
};
