const Web3 = require('web3');
const fs = require('fs');
const contractOfIncrementer = require('./compile');

require('dotenv').config();
const privatekey = process.env.PRIVATE_KEY;

const providerRPC = {
    development: 'https://goerli.infura.io/v3/' + process.env.INFURA_ID,
    moonbase: 'https://rpc.testnet.moonbeam.network',
};