const { expect } = require("chai");
describe('SimpleToken contract', function () {
    let simpleToken
    let hardhatSimpleToken
    let owner
    let addr1
    let addr2
    let addrs

    beforeEach(async function () {
        simpleToken = await ethers.getContractFactory('SimpleToken');
        [owner, addr1, addr2, ... addrs] = await ethers.getSigners();

        hardhatSimpleToken = await simpleToken.deploy(
            'SimpleToken Test',
            'SimpleToken Test',
            1,
            1000000
        )

        await hardhatSimpleToken.deployed()
    })

    describe('Deployment', function () {
        it('should assign the total suppl of tokens to the owner', async function () {
            const ownerBalance = await hardhatSimpleToken.balanceOf(owner.address)
            expect(await hardhatSimpleToken.totalSupply()).to.equal(ownerBalance)
        });
    })

    describe('Transaction', function () {
        it('should transfer tokens between accounts', async () => {
            await hardhatSimpleToken.transfer(addr1.address, 50)
            const addr1Balance = await hardhatSimpleToken.balanceOf(addr1.address)
            expect(addr1Balance).to.equal(50)

            await hardhatSimpleToken.connect(addr1).transfer(addr2.address, 50)
            const addr2Balance = await hardhatSimpleToken.balanceOf(addr2.address)
            expect(addr2Balance).to.equal(50)
        });

        it("should fail if sender doesn't have enough tokens", async () => {
            const initialOwnerBalance = await hardhatSimpleToken.balanceOf(owner.address)
            await expect(hardhatSimpleToken.connect(addr1).transfer(owner.address, 10000))
                .to.be.revertedWith('ERC20: transfer amount exceeds balance')

            expect(await hardhatSimpleToken.balanceOf(owner.address)).to.equal(initialOwnerBalance)
        })

        it('should update balance after transfers', async () => {
            const initialOwnerBalance = await hardhatSimpleToken.balanceOf(owner.address)

            await hardhatSimpleToken.transfer(addr1.address, 100)
            await hardhatSimpleToken.transfer(addr2.address, 50)

            const finalOwnerBalance = await hardhatSimpleToken.balanceOf(owner.address)

            expect(finalOwnerBalance).to.equal(initialOwnerBalance - 150)

            const addr1Balance = await hardhatSimpleToken.balanceOf(addr1.address)
            expect(addr1Balance).to.equal(100)

            const addr2Balance = await hardhatSimpleToken.balanceOf(addr2.address)
            expect(addr2Balance).to.equal(50)
        });
    })
})