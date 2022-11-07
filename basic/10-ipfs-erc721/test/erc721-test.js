require("@nomiclabs/hardhat-waffle");
const { expect } = require("chai");

describe("MYERC721 contract", function () {
    let deployer, other;
    let token;

    const name = "MYERC721";
    const symbol = "MAIT";
    const baseURI = "my.app/";

    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const MINTER_ROLE = keccak256(toUtf8Bytes("MINTER_ROLE"));

    beforeEach(async () => {
        [deployer, other] = await ethers.getSigners();

        const MYERC721_MOCK = await ethers.getContractFactory("MYERC721");
        token = await MYERC721_MOCK.deploy(name, symbol, baseURI);
        await token.deployed();
    })

    it('token has correct name', async () => {
        expect(await token.name()).to.equal(name);
    });

    it('should token has correct symbol', async () => {
        expect(await token.symbol()).to.equal(symbol);
    });

    it('deployer has the default admin role', async function () {
        expect(await token.getRoleMemberCount(DEFAULT_ADMIN_ROLE)).to.be.equal("1");
        expect(await token.getRoleMember(DEFAULT_ADMIN_ROLE, 0)).to.equal(
            deployer.address
        );
    });

    it("deployer has the minter role", async function () {
        expect(await token.getRoleMemberCount(MINTER_ROLE)).to.be.equal("1");
        expect(await token.getRoleMember(MINTER_ROLE, 0)).to.equal(
            deployer.address
        );
    });

    it("minter role admin is the default admin", async function () {
        expect(await token.getRoleAdmin(MINTER_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
    });

    describe("pausing", function () {
        it("deployer can pause", async function () {
            await expect(token.pause())
                .to.emit(token, "Paused")
                .withArgs(deployer.address);

            expect(await token.paused()).to.equal(true);
        });

        it("deployer can unpause", async function () {
            await token.pause();
            await expect(token.unpause())
                .to.emit(token, "Unpaused")
                .withArgs(deployer.address);

            expect(await token.paused()).to.equal(false);
        });

        it("cannot mint while paused", async function () {
            await token.pause();

            await expect(
                token.connect(deployer).mint(other.address)
            ).to.be.revertedWith("ERC721Pausable: token transfer while paused");
        });

        it("other accounts cannot pause", async function () {
            await expect(token.connect(other).pause()).to.be.revertedWith(
                "ERC721PresetMinterPauserAutoId: must have pauser role to pause"
            );
        });

        it("other accounts cannot unpause", async function () {
            await token.pause();

            await expect(token.connect(other).unpause()).to.be.revertedWith(
                "ERC721PresetMinterPauserAutoId: must have pauser role to unpause"
            );
        });
    });

    describe("burning", function () {
        it("holders can burn their tokens", async function () {
            const tokenId = BigNumber.from("0");

            await token.mint(other.address);

            await expect(token.connect(other).burn(tokenId))
                .to.emit(token, "Transfer")
                .withArgs(other.address, ZERO_ADDRESS, tokenId);

            expect(await token.balanceOf(other.address)).to.be.equal("0");
            expect(await token.totalSupply()).to.be.equal("0");
        });
    });
});