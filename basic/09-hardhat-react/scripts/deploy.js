async function main() {
  if (network.name === 'hardhat') {
    console.warn(
        'You are trying to deploy a contract to the Hardhat Network, which' +
        'gets automatically created and destroyed every time. Use the Hardhat' +
        " option '--network localhost'");
  }

  const [deployer] = await ethers.getSigners()
  console.log(
      'Deploying the contracts with the account:',
      await deployer.getAddress()
  );

  const Token = await ethers.getContractFactory('SimpleToken');
  const token = await Token.deploy('Hello', 'Token', 1, 10000);
  await token.deployed();

  console.log('SimpleToken address:', token.address)

  saveFrontendFiles(token, deployer);
}

function saveFrontendFiles(token, deployerAccount) {
  const fs = require('fs');
  const contractsDir = __dirname + '/../frontend/src/contracts';

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
      contractsDir + '/contract-address.json',
      JSON.stringify({ contractAddress: token.address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync('SimpleToken');
  s.writeFileSync(
      contractsDir + '/SimpleToken.json',
      JSON.stringify(TokenArtifact, null, 2)
  )

  fs.writeFileSync(
      contractsDir + '/deployer.json',
      JSON.stringify({ deployer: deployerAccount }, undefined, 2)
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  });