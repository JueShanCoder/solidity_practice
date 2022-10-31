const Web3 = require('web3');
const fs = require('fs');
const contractOfIncrementer = require('./compile');

require('dotenv').config();
const privatekey = process.env.PRIVATE_KEY;
const providerRPC = {
    development: 'https://sepolia.infura.io/v3/' + process.env.INFURA_ID,
    moonbase: 'https://rpc.testnet.moonbeam.network',
};

// 创建 web3 实例
const web3 = new Web3(providerRPC.development);

// 通过私钥创建账户对象
const account = web3.eth.accounts.privateKeyToAccount(privatekey);
const account_from = {
    privateKey: privatekey,
    accountAddress: account.address
};

// 合约的 byte 码
const bytecode = contractOfIncrementer.evm.bytecode.object;

// 合约的 ABI 编码
const abi = contractOfIncrementer.abi;

const Trans = async () => {
    console.log('--开始部署合约--')
    console.log(`账户地址 ${account.address}`)

    // 通过合约的 abi 编码创建新的合约实例
    const deployContract = new web3.eth.Contract(abi);

    // 将合约部署到区块链上
    const deployTx = deployContract.deploy(
        {
            data: bytecode,
            arguments: [5],
        }
    );
    // 使用私钥签名以太坊交易
    const createTransaction = await web3.eth.accounts.signTransaction(
        {
            data: deployTx.encodeABI(),
            gas: 8000000,
        },
        account_from.privateKey
    );

    // 发送已签名的交易
    const createReceipt = await web3.eth.sendSignedTransaction(
        createTransaction.rawTransaction
    );

    console.log(`合同部署在 ${createReceipt.contractAddress}`);

    const deployedBlockNumber = createReceipt.blockNumber;
    console.log(`部署合同的区块号为 ${deployedBlockNumber}`);

    console.log('--部署完成--');

    console.log('--调用合约 getNumber() --');
    let incrementer = new web3.eth.Contract(abi, createReceipt.contractAddress);

    let number = await incrementer.methods.getNumber().call();
    console.log(`调用 getNumber() ： ${number}`);

    console.log('--调用合约 Increment 方法--')
    const _value = 3;
    let incrementTx= incrementer.methods.increment(_value);

    // 签名合约-data
    let incrementTransaction = await web3.eth.accounts.signTransaction(
        {
            to: createReceipt.contractAddress,
            data: incrementTx.encodeABI(),
            gas: 8000000,
        },
        account_from.privateKey
    );

    // 发送交易并获取交易 hash
    let incrementReceipt = await web3.eth.sendSignedTransaction(
        incrementTransaction.rawTransaction
    );
    console.log(`increment() 交易的 hash 为 ${incrementReceipt.transactionHash}`)

    number = await incrementer.methods.getNumber().call();
    console.log(`调用 increment() 后 getNumber() 返回值为 ${number}`)

    console.log('--调用合约 reset() --')
    const resetTx = incrementer.methods.reset();

    const resetTransaction = await web3.eth.accounts.signTransaction(
        {
            to: createReceipt.contractAddress,
            data: resetTx.encodeABI(),
            gas: 8000000,
        },
        privatekey
    );

    const resetReceipt = await web3.eth.sendSignedTransaction(
        resetTransaction.rawTransaction
    );
    console.log(`reset() 交易的 hash 为 ${resetReceipt.transactionHash}`);

    number = await incrementer.methods.getNumber().call();
    console.log(`reset() 执行后 getNumber() 为：${number}`);

    const web3Socket = new Web3(
        new Web3.providers.WebsocketProvider(
            'wss://sepolia.infura.io/ws/v3/' + process.env.INFURA_ID
        )
    );

    incrementer = new web3Socket.eth.Contract(abi, createReceipt.contractAddress);

    // listen to  Increment event only once
    incrementer.once('Increment', (error, event) => {
        console.log('I am a onetime event listner, I am going to die now');
    });

    // listen to Increment event continuously
    incrementer.events.Increment(() => {
        console.log('I am a longlive event listener, I get a event now');
    });

    for (let step = 0; step < 3; step++) {
        console.log(`step ：${step}`);
        console.log(`account_from.privateKey ：${account_from.privateKey}`);
        incrementTransaction = await web3.eth.accounts.signTransaction(
            {
                to: createReceipt.contractAddress,
                data: incrementTx.encodeABI(),
                gas: 8000000,
            },
            privatekey
        );


        await web3.eth.sendSignedTransaction(incrementTransaction.rawTransaction);

        if (step === 2) {
            // clear all the listeners
            web3Socket.eth.clearSubscriptions();
            console.log('Clearing all the events listeners !!!!');
        }
    }

    // 获取历史事件
    console.log('调用历史事件');
    const pastEvents = await incrementer.getPastEvents('Increment', {
        fromBlock: deployedBlockNumber,
        toBlock: 'latest',
    });

    pastEvents.map((event) => {
        console.log(event);
    })

    // 检查异常交易
    incrementTx = incrementer.methods.increment(0);

    incrementTransaction = await web3.eth.accounts.signTransaction(
        {
            to: createReceipt.contractAddress,
            data: incrementTx.encodeABI(),
            gas: 8000000,
        },
        account_from.privateKey
    );

    await web3.eth.sendSignedTransaction(incrementTransaction.rawTransaction)
        .on('error', console.error);
};

Trans()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })