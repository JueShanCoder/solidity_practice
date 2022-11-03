const { expect } = require("chai");

describe('Greeter', function () {
    it("should return the new greeting once it's changed", async function () {
        const Greeter = await ethers.getContractFactory("Greeter");
        const greeter = await Greeter.deploy("Hello World!");

        await greeter.deployed();
        expect(await greeter.greet()).to.equal("Hello World!");

        await greeter.setGreeting("hello Dapp-Learning");
        expect(await greeter.greet()).to.equal("hello Dapp-Learning");
    });
});