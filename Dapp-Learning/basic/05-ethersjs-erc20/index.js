const { ethers } = require('ethers');
const fs = require('fs');
const contractFile = require('./compile');

require('dotenv').config();
const privatekey = process.env.PRIVATE_KEY;

// Provider
const providerRPC = {
    development: {
        name: 'moonbeam-development',
        rpc: 'http://localhost:8545',
        chainId: 1281,
    },
    moonbase: {
        name: 'moonbase-alpha',
        rpc: 'https://rpc.testnet.moonbeam.network',
        chainId: 1287,
    },
};

const provider = new ethers.providers.InfuraProvider(
    'sepolia',
    process.env.INFURA_ID
)

const account_from = {
  privateKey: privatekey,
};

const bytecode = contractFile.evm.bytecode.object;
const abi = contractFile.abi;

// Create wallet
let wallet = new ethers.Wallet(account_from.privateKey, provider);

// Deploy wallet
const deployContractIns = new ethers.ContractFactory(abi, bytecode, wallet);

const Trans = async () => {
    console.log('=================== 1.Deploy Contract');
    console.log(`wallet address is ${wallet.address}`);

    // Send Tx
    const deployedContract = await deployContractIns.deploy(
        'hello',
        'Dapp',
        1,
        100000000,
        { gasLimit: 8000000 }
    );

    await deployedContract.deployed();

    console.log(`Contract deployed at address: ${deployedContract.address}`);

    console.log();
    console.log('=================== 2.Call Transaction Interface Of Contract');

    const transactionContract = new ethers.Contract(
        deployedContract.address,
        abi,
        wallet
    );

    console.log(`Transfer 100000 to address: 0x3AF4AcF289E1EB77e197d11Ae89a9A5d1F0Fe2A7`);

    // Call Contract
    const transferReceipt = await transactionContract.transfer(
        '0x3AF4AcF289E1EB77e197d11Ae89a9A5d1F0Fe2A7',
        100000
    );
    await transferReceipt.wait();

    console.log(`Tx successful with hash: ${transferReceipt.hash}`);

    // Call Function
    console.log();
    console.log('=================== 3.Call Read Interface Of Contract');
    const providerContract = new ethers.Contract(
        deployedContract.address,
        abi,
        provider
    );

    // Call Contract
    const balanceVal = await providerContract.balanceOf(
        '0x3AF4AcF289E1EB77e197d11Ae89a9A5d1F0Fe2A7'
    );

    const balance = await transactionContract.balanceOf(
        '0x3AF4AcF289E1EB77e197d11Ae89a9A5d1F0Fe2A7'
    );
    console.log(`balance of 0x3AF4AcF289E1EB77e197d11Ae89a9A5d1F0Fe2A7 is: ${balanceVal}, By wallet balance is ${balance}`);

    // Listen to Events
    console.log();
    console.log('=================== 4.Listen To Events');

    // Listen to event once
    providerContract.once('Transfer', (from, to, value) => {
        console.log(
            `I am a once Event Listener, I have got an event Transfer, from: ${from}   to: ${to}   value: ${value}`
        );
    });

    // Listen to events continuously
    providerContract.on('Transfer', (from, to, value) => {
        console.log(
            `I am a longstanding Event Listener, I have got an event Transfer, from: ${from}   to: ${to}   value: ${value}`
        );
    });

    // Listen to events with filter
    let topic = ethers.utils.id('Transfer(address,address,uint256)');
    let filter = {
        address: deployedContract.address,
        topics: [topic],
        fromBlock: await provider.getBlockNumber(),
    };

    providerContract.on(filter, (from, to, value) => {
        console.log(
            `I am a filter Event Listener, I have got an event Transfer, from: ${from}   to: ${to}   value: ${value}`
        );
    });

    for (let step = 0; step < 3; step++) {
        let transferTransaction = await transactionContract.transfer(
            '0x3AF4AcF289E1EB77e197d11Ae89a9A5d1F0Fe2A7',
            10
        );
        await transferTransaction.wait();

        if (step === 2) {
            console.log('Going to remove all Listeners');
            providerContract.removeAllListeners();
        }
    }
};

Trans()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });