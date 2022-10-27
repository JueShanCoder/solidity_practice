let web3 = require('web3');
let solc = require('solc');
let fs = require('fs');


// Get privateKey from environment
require('dotenv').config();
const privateKey = process.env.PRIVATE_KEY;

// Load contract 
const source = fs.readFileSync('Incrementer.sol', 'utf8');

// compile solidity 
const input = {
    language: 'Solidity',
    sources: {
        'Incrementer.sol': {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
};

const tempFile = JSON.parse(solc.compile(JSON.stringify(input)))
const contractFile = tempFile.contracts['Incrementer.sol']['Incrementer'];

// Get bin & abi
const bytecode= contractFile.evm.bytecode.object;
const abi = contractFile.abi;

// Create Web3 with goerli provider, you can change goerli to other testnet 
const web3 = new Web3('https://goerli.infura.io/v3/' + process.env.INFURA_ID);

// Create account from privatekey 
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
const account_from = {
    privateKey: privateKey,
    accountAddress: account.address,
};

// Deploy Contract 
const Deploy = async() => {
    // Create contract instance
    const deployContract = new web3.eth.Contract(abi);

    // Create tx
    const deployTx = deployContract.deploy({
        data: bytecode,
        arguments: [0], // Pass arguments to the contract constructor on deployment(_initialNumber in Incremental.sol)
    });

    // Sign Tx
    const deployTransaction = await web3.eth.accounts.signTransaction(
        {
            data: deployTx.encodeABI(),
            gas: 8000000,
        },
        account_from.privateKey
    );

    const deployReceipt = await web3.eth.sendSignedTransaction(deployTransaction.rawTransaction);

    //
    console.log(`Contract deployed at address: ${deployReceipt.contractAddress}`);
};

//
Deploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });