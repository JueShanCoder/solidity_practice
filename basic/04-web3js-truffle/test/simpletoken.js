const Simpletoken = artifacts.require('SimpleToken')

contract('SimpleToken', (accounts) => {
   it(`Should put 100000 to the ${accounts[0]}`, async () => {
        const simpleTokenIns = await Simpletoken.deployed();
        const balance = (
           await simpleTokenIns.balanceOf.call(accounts[0])
        ).toNumber();
        assert.equals(
            balance,
            100000,
            `the balance of ${accounts[0]} was not 1000`
        );
   });

   // change the account
   it('Transfer 100 to other account', async () => {
       const simpleTokenIns = await Simpletoken.deployed();
   });
});

