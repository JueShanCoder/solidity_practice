// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const {hre, ethers, network} = require("hardhat");
const ipfsAPI = require('ipfs-api');
const fs = require('fs');
// const { ethers, network } = require("hardhat");
const { checkServerIdentity } = require("tls");
const { resolve } = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account: ", deployer.address);

  const contractFactory = await ethers.getContractFactory("MYERC721");
  // name、symbol、baseURI
  const myerc721Ins = await contractFactory.deploy("MYERC721", "TEST", "");

  console.log("ERC721 address: ", myerc721Ins.address);

  myerc721Ins.on("Transfer", (from, to, tokenId) => {
    console.log("Mint token successfully, and the token id is ", String(tokenId));

    myerc721Ins.tokenURI(tokenId).then((URL) => {
      console.log(`The URL of token ${tokenId} is ${URL}`);
      process.exit(0);
    }).catch(error => {
      console.error(error);
      process.exit(1);
    });
  });

  console.log("Going to add art.jpg to ipfs");
  const ipfs = ipfsAPI('127.0.0.1', 5001, {protocol: 'http'});
  const filecontent = fs.readFileSync('./art.jpg');
  const filehash = (await ipfs.add(filecontent))[0].hash;

  console.log(`IPFS URL of art.jpg is : /ipfs/${filehash}`);

  console.log("Going to create a token with ipfs url");
  const ipfsurl = "/ipfs/" + filehash;
  myerc721Ins.mintWithTokenURI(deployer.address, ipfsurl);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => {})
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
