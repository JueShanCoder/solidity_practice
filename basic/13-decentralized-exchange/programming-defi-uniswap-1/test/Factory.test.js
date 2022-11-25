require("@nomiclabs/hardhat-waffle");
const { expect } = require("chai");

const toWei = (value) => ethers.utils.parseEther(value.toString());

describe('Factory', function () {
    let owner;
    let factory;
    let token;

    beforeEach(async () => {
        [owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("Token", "TKN", toWei(1000000));
        await token.deployed();

        const Factory = await ethers.getContractFactory("Factory");
        factory = await Factory.deploy();
        await factory.deployed();
    })

    it('is deployed', async () => {
        expect(await factory.deployed()).to.equal(factory);
    });

    describe('createExchange', async () => {
        it('deploys an exchange', async () => {
            const exchangeAddress = await factory.callStatic.createExchange(
                token.address
            );
        });
    });

});