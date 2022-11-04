const { expect } = require("chai");

describe("Token contract", function (){
   let Token;
   let hardhatToken;
   let owner;
   let addr1;
   let addr2;
   let addrs;

   beforeEach(async () => {
       Token = await ethers.getContractFactory("SimpleToken");
       [owner, addr1, addr2, ... addrs] = await ethers.getSigners();

       hardhatToken = await Token.deploy("HEHE", "HH", 1, 100000000);
   });

   describe("Deployment", () => {
       it('Should assign the total supply of tokens to the owner', async function () {
            const ownerBalance= await hardhatToken.balanceOf(owner.address);
            expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
       });
   });

   describe("Transaction", () => {
       it('Should transfer tokens between accounts', async function () {
           await hardhatToken.transfer(addr1.address, 50);
           const add1Balance = await hardhatToken.balanceOf(addr1.address);
           expect(await add1Balance).to.equal(50);

           await hardhatToken.connect(addr1).transfer(addr2.address, 50);
           const add2Balance = await hardhatToken.balanceOf(addr2.address);
           const add1balance = await hardhatToken.balanceOf(addr1.address);
           console.log(`add1 balance is ${add1balance}`);
           const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);
           console.log(`owner balance is ${initialOwnerBalance}`)
           expect(await  add2Balance).to.equal(50);
       });

       it("should fail if sender doesn't have enough tokens", async function () {
           const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);
           console.log(`owner balance is ${initialOwnerBalance}`);
           await expect(
               hardhatToken.connect(addr1).transfer(owner.address, 1)
           ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

           expect(await hardhatToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
       });

       it('should update balance after transfers', async function () {
            const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);
            console.log(`owner balance is ${initialOwnerBalance}`);
            await hardhatToken.transfer(addr1.address, 100);
            await hardhatToken.transfer(addr2.address, 50);

            const finalOwnerBalance = await hardhatToken.balanceOf(owner.address);
            expect(finalOwnerBalance).to.equal(initialOwnerBalance - 150);

            const addr1Balance = await hardhatToken.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(100);

            const addr2Balance = await hardhatToken.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);

       });
   });
});