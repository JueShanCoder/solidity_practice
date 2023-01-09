const Simpletoken = artifacts.require('SimpleToken')

contract('SimpleToken', (accounts) => {
    console.log("simpleToken.js => SimpleToken");
    console.log(`accounts：${accounts}`);
    it(`Should put 100000 to the ${accounts[0]}`, async () => {
        const simpleTokenIns = await Simpletoken.deployed();
        const balance = (
           await simpleTokenIns.balanceOf.call(accounts[0])
        ).toNumber();
        assert.equal(
            balance,
            100000,
            `the balance of ${accounts[0]} was not 1000`
        );
    });

    // change the account
    it('Transfer 100 to other account', async () => {
        console.log("simpleToken.js => Transfer 100 to other account");
        const simpleTokenIns = await Simpletoken.deployed();

        const target = "0x3AF4AcF289E1EB77e197d11Ae89a9A5d1F0Fe2A7";

        // transfer 1000 to other account;
        await simpleTokenIns.transfer(target, 1000);

        // check the balance of target
        const balance = (await simpleTokenIns.balanceOf.call(target)).toNumber();
        assert.equal(balance, 1000, `the balance of ${target} wasn't 1000`);
        });
});

