async function main() {
    if (network.name === 'hardhat') {
        console.warn(
            'You are trying to deploy a contract to the Hardhat Network, which' +
            'gets automatically created and destroyed every time. Use the Hardhat' +
            " option '--network localhost'"
        )
    }

    const [deployer] = await ethers.getSigners();
    console.log('Deploying the contracts with the account', await deployer.address);

    console.log(`Account balance: `, (await deployer.getBalance()).toString())

    const Token = await ethers.getContractFactory('SimpleToken')
    const token = await Token.deploy('Test', 'SimpleToken', 1, 10000)
    await token.deployed()

    console.log('Token address:', token.address)

    saveFrontendFiles(token);
}

function saveFrontendFiles(token) {
    const fs = require('fs')
    const contractsDir = __dirname + '/../frontend/src/contracts'

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir)
    }

    fs.writeFileSync(
        contractsDir + '/contract-address.json',
        JSON.stringify({ Token: token.address }, undefined, 2)
    )

    const TokenArtifact = artifacts.readArtifactSync('SimpleToken')

    fs.writeFileSync(
        contractsDir + '/Token.json',
        JSON.stringify(TokenArtifact, null, 2)
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })