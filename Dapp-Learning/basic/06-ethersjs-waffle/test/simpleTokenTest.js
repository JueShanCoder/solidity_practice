const  { use, expect } = require('chai');
const  { deployContract, MockProvider, solidity } = require('ethereum-waffle');
const simpleToken = require("../build/SimpleToken.json");

use(solidity);

describe('SimpleToken', () => {
    const [wallet, walletTo] = new MockProvider({
        ganacheOptions: {
            accounts: [{balance: '1000', secretKey: '0xc29e42e34132b197c810f04d69ff9d9f7dacf49ca0163e710424bc2d32a29dc7'},{balance: '0', secretKey: '0x69d0c6d5d08c213ee5a901f7d74d12ab09e8077a138b3f325f116743ac406ec6'}]
        }
    }).getWallets();

    console.log(`wallet is ${wallet.address} and walletTo is ${walletTo.address}`);
    let token;

    beforeEach(async () => {
        token = await deployContract(wallet, simpleToken, ["HEHE", "HH", 0, 100000000]);
    });

    it('Assigns initial balance', async () => {
        console.log("*****2");
        expect(await token.balanceOf(wallet.address)).to.equal(100000000);
    });

    it('Transfer adds amount to destination account', async () => {
        await token.transfer(walletTo.address, 7);
        expect(await token.balanceOf(walletTo.address)).to.equal(7);
    });

    it('Transfer emits event',  async () => {
        await expect(token.transfer(walletTo.address,7))
            .to.emit(token, 'Transfer')
            .withArgs(wallet.address, walletTo.address, 7);
    });

    it('Can not transfer above the amount', async () => {
        await expect(token.transfer(walletTo.address, 100000000000)).to.be.reverted;
    });

    it('Calls totalSupply on SimpleToken contract', async () => {
        await token.totalSupply();
        expect('totalSupply').to.be.calledOnContract(token);
    });

    it('Calls balanceOf with sender address on SimpleToken contract', async () => {
        await token.balanceOf(wallet.address);
        expect('balanceOf').to.be.calledOnContract(token, [wallet.address]);
    });
});