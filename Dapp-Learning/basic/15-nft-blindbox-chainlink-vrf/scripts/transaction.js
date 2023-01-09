const hre = require("hardhat");
const { readDeployment } = require('./utils');

async function main() {
    const deployment = readDeployment();
    const addr = deployment.dndAddress;
    const requestID = deployment.requestID;

    const dnd = await hre.ethers.getContractAt("DungeonsAndDragonsCharacter", addr)

    // Do the blindCharacter
    console.log("Going to do blindCharacter");
    const tx1 = await dnd.blindCharacter(requestID);
    await tx1.wait();

    console.log("BlindCharacter finished");

    // get character
    console.log("Going to get characters");
    const overview = await dnd.characters(0)
    console.log(overview);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1);
    });