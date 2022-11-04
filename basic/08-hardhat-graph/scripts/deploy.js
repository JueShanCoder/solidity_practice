const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  const Token = await ethers.getContractFactory('SimpleToken');
  const token = await Token.deploy('SimpleToken', 'SimpleToken', 18, 10000000000);

  console.log('Contract address:', token.address);

  const receiver = "0x50B38C674BcD576a25C577DB72e19228944a7a97";
  const account2 = "0x3AF4AcF289E1EB77e197d11Ae89a9A5d1F0Fe2A7";
  console.log('Transfer 50 to receiver', receiver);
  let transferReceipt = await token.transfer(receiver, 50);
  await transferReceipt.wait();

  let balance = await token.balanceOf(receiver);
  console.log(`receiver token is ${balance.toString()}`);

  // approve transfer to receiver
  let approveReceipt = await token.approve(receiver, 1000);
  await approveReceipt.wait();
  // approve token number
  console.log(`allowance of ${deployer.address} to ${receiver} is `, (await token.allowance(deployer.address, receiver)).toString());

  token.connect(receiver);
  const bool = await token.transferFrom(deployer.address, account2, 100);
  console.log(`transferFrom is  ${bool}`);

  const ac1 = await token.balanceOf(deployer.address);
  const ac2 = await token.balanceOf(receiver);
  const ac3 = await token.balanceOf(account2);
  console.log(`owner balance is: ${ac1.toString()}, receiver balance is: ${ac2.toString()}, account3 balance is ${ac3.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });