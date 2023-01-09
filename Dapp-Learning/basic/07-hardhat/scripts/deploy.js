const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  const Token = await ethers.getContractFactory('SimpleToken');
  const token = await Token.deploy('SimpleToken', 'SimpleToken', 18, 10000000000);

  console.log('Token address:', token.address);

  let balance = await token.balanceOf(deployer.address);
  console.log(balance.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });