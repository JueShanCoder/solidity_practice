const { expect } = require("chai")

describe("CrowdFunding contract", () => {
    let crowdFundingContract;

    beforeEach(async () => {
        const[owner] = await ethers.getSigners()
        console.log(owner.address)
        const crowdFundingContractFactory = await ethers.getContractFactory("CrowdFunding")
        crowdFundingContract = await crowdFundingContractFactory.deploy();
        await crowdFundingContract.deployed()
        expect(crowdFundingContract.address).to.not.equal(null)
    })

    describe("Start new Project", async () => {
        await crowdFundingContract.startProject("Buy toys", "Buy toys", 1, 100)
        let allProject = await crowdFundingContract.returnAllProjects()
        expect(allProject.length).to.equal(1)
    })
})