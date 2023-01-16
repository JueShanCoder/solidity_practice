import { ethers } from 'ethers'

const INFURA_ID = 'c570963cc207464b819a8924d22b8b77'
const provider = new ethers.provider.JsonRpcProvider(`https://goerli.infura.io/v3/${INFURA_ID}`)

const privateKey = '559ad77fb5bf5c0f0f54e2fc943a0b4a6c609cb5cc76b57d67efdbf8f08cf725'
const wallet = new ethers.Wallet(privateKey, provider)

const address = await wallet.getAddress()
console.log(`1. 获取钱包地址`)
console.log(`钱包地址：${address}`)

console.log(`钱包助记词：${wallet.mnemonic.phrase}`)
console.log(`钱包密钥：${wallet.privateKey}`)

const txCount1 = await wallet.getTransactionCount()
console.log(`钱包发送交易次数: ${txCount1}`)

    // 5. 发送ETH
    // 如果这个钱包没rinkeby测试网ETH了，去水龙头领一些，钱包地址: 0xe16C1623c1AA7D919cd2241d8b36d9E79C1Be2A2
    // 1. chainlink水龙头: https://faucets.chain.link/rinkeby
    // 2. paradigm水龙头: https://faucet.paradigm.xyz/
    console.log(`\n5. 发送ETH（测试网）`);
    // i. 打印交易前余额
    console.log(`i. 发送前余额`)
    console.log(`钱包2: ${ethers.utils.formatEther(await wallet.getBalance())} ETH`)
    // ii. 构造交易请求，参数：to为接收地址，value为ETH数额
    const tx = {
        to: address1,
        value: ethers.utils.parseEther("0.001")
    }
    // iii. 发送交易，获得收据
    console.log(`\nii. 等待交易在区块链确认（需要几分钟）`)
    const receipt = await wallet2.sendTransaction(tx)
    await receipt.wait() // 等待链上确认交易
    console.log(receipt) // 打印交易详情
    // iv. 打印交易后余额
    console.log(`\niii. 发送后余额`)
    console.log(`钱包2: ${ethers.utils.formatEther(await wallet2.getBalance())} ETH`)