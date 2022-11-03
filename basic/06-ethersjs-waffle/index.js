const fs = require("fs");
const SimpleToken = require("./build/SimpleToken.json");
const { ethers } = require("ethers");

require("dotenv").config();
const privateKey = process.env.PRIVATE_KEY;

const web3Provider = new ethers.providers.InfuraProvider(
    "sepolia",
    process.env.INFURA_ID
);

const wallet = new ethers.Wallet(privateKey,web3Provider);

let address = "0x3AF4AcF289E1EB77e197d11Ae89a9A5d1F0Fe2A7";

let bal;

// support eip1559
async function getGasPrice() {
    return await web3Provider.getFeeData().then(async function (res) {
        let maxFeePerGas = res.maxFeePerGas;
        let maxPriorityFeePerGas = res.maxPriorityFeePerGas;
        console.log("maxFeePerGas: ", maxFeePerGas.toString());
        console.log("maxPriorityFeePerGas", maxPriorityFeePerGas.toString());

        return {
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
        };
    });
}

async function checkBalance() {
    bal = await web3Provider.getBalance(address).then((balance) => {
        // balance is a BigNumber (in wei); format is as a sting (in ether)
        return ethers.utils.formatEther(balance);
    });
    console.log("balance: ", bal);
}

checkBalance();

let token;
async function deploy () {
    let option = await getGasPrice();
    const simpleToken = new ethers.ContractFactory(
        SimpleToken.abi,
        SimpleToken.bytecode,
        wallet
    );
    token = await simpleToken.deploy("HEHE", "HH", 1, 100000000);
    await token.transfer(
        address,
        ethers.utils.parseEther("0.00000000001"),
        option,
    );
    console.log(token.address);

    console.log(token.deployTransaction.hash);

    await token.deployed();

    let bal = await token.balanceOf(wallet.address);
    console.log(bal.toString());
}

deploy();