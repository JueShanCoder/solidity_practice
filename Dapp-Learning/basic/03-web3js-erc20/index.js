const Web3 = require('web3');
const fs = require('fs');
const contractFile = require('./compile');

require('dotenv').config();
const privatekey = process.env.PRIVATE_KEY;

// account2.
const receiver = '0x3AF4AcF289E1EB77e197d11Ae89a9A5d1F0Fe2A7';

// Provider.
const web3 = new Web3(
    new Web3.providers.HttpProvider(
        'https://sepolia.infura.io/v3/' + process.env.INFURA_ID
    )
);

// account.
const account = web3.eth.accounts.privateKeyToAccount(privatekey);
const account_from = {
    privateKey: privatekey,
    accountAddress: account.address,
};

// sol -> abi + bytecode.
const bytecode = contractFile.evm.bytecode.object;
const abi = contractFile.abi;

const Trans = async () => {
    console.log(
      `Attempting to deploy from account ${account_from.accountAddress}`
    );

    web3.eth.getBlockNumber(function (error,result) {
        console.log(`Current block number is ${result}`)
    });

    // Create deploy Contract Instance.
    const deployContract = new web3.eth.Contract(abi);

    // Deploy contract.
    const deployTx = deployContract.deploy({
        data: bytecode,
        arguments: ['DAPPLEARNING', 'DAPP', 0, 10000000],
    });

    // Sign Transaction and send.
    const deployTransaction = await web3.eth.accounts.signTransaction(
        {
            data: deployTx.encodeABI(),
            gas: '8000000',
        },
        account_from.privateKey
    );

    // Send Tx and Wait for Receipt.
    const deployReceipt = await web3.eth.sendSignedTransaction(
        deployTransaction.rawTransaction
    );

    console.log(`Contract deployed at address: ${deployReceipt.contractAddress}`);

    const erc20Contract = new web3.eth.Contract(
        abi,
        deployReceipt.contractAddress
    );

    // build the Tx
    const transferTx = erc20Contract.methods
        .transfer(receiver, 100000)
        .encodeABI();

    // Sign Tx with PK
    const transferTransaction = await web3.eth.accounts.signTransaction(
        {
            to: deployReceipt.contractAddress,
            data: transferTx,
            gas: 8000000,
        },
        account_from.privateKey
    );

    // Send Tx and wait for receipt
    await web3.eth.sendSignedTransaction(
        transferTransaction.rawTransaction
    );

    await erc20Contract.methods
        .balanceOf(receiver)
        .call()
        .then((result) => {
           console.log(`The balance of receiver is ${result}`);
        });

    await erc20Contract.methods
        .balanceOf(account_from.accountAddress)
        .call()
        .then((result) => {
            console.log(`The balance of owner is ${result}`);
        });
};

Trans()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1);
    });

