const hre = require('hardhat');
require('@nomiclabs/hardhat-web3');
const { BigNumber } = require('ethers');
require('dotenv').config();
const {readDeployment} = require('./utils');

async function main() {
    const provider = new ethers.providers.WebsocketProvider(`wss://goerli.infura.io/ws/v3/${process.env.INFURA_ID}`);
    const { abi: RandomNumberConsumerABI } = require('../artifacts/contracts/RandomNumberConsumer.sol/RandomNumberConsumer.json');

    const deployment = readDeployment();
    const addr = deployment.RandomNumberConsumerAddress;

    if (!addr) {
        console.log(`Please deploy contract RandomNumberConsumer first`);
        return;
    } else {
        console.log(`The contract address is ${addr}`)
    }
    let randomNumberConsumer, user1, iface;

    randomNumberConsumer = new ethers.Contract(addr, RandomNumberConsumerABI, provider);
    iface = new ethers.utils.Interface(RandomNumberConsumerABI);
    [user1] = await ethers.getSigners();

    let random0ID, random0Res;

    // 监听 randomNumberConsumer 的请求随机数事件
    const filterCall = {
        address: addr,
        topics: [ethers.utils.id('RequestId(address,uint256)')],
    };

    // 监听 chainLink VRF Coordinator 的随机数回写事件
    const filterRes = {
        address: addr,
        topics: [ethers.utils.id('FulfillRandomness(uint256, uint256[])')]
    };

    console.log(`Listen on random number call...`);
    provider.on(filterCall, (log, event) => {

    });

}