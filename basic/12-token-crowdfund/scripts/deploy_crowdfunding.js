const hre = require("hardhat")

async function main() {
    const [deployer] = await ethers.getSigners()

    console.log("Deploying contracts with the account:", deployer.address)

    console.log("Account balance:", (await deployer.getBalance()).toString())

    // deploy Crowdfunding
    const crowFundingContractFactory = await ethers.getContractFactory("CrowdFunding")
    const crowFundingContract = await crowFundingContractFactory.deploy()
    await crowFundingContract.deployed()

    console.log("CrowFundingContract address:", crowFundingContract.address)

    // start project
    await crowFundingContract.startProject("Buy toys", "Buy toys", 1, 100)
    let allProjects = await crowFundingContract.returnAllProjects()

    const artifact = artifacts.readArtifactSync('Project')
    let project
    let details
    for(let i=0; i<allProjects.length; i++) {
        project = new ethers.Contract(allProjects[i], artifact.abi, deployer)
        details = await project.getDetails()
        console.log(details)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })