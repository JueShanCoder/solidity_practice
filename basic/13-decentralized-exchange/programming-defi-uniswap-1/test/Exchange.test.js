require("@nomiclabs/hardhat-waffle");
const { expect } = require("chai");

const toWei = (value) => ethers.utils.parseEther(value.toString());

const fromWei = (value) =>
    ethers.utils.formatEther(
        typeof value === "string" ? value : value.toString()
    );

const getBalance = ethers.provider.getBalance;

describe("Exchange", () => {
    let owner;
    let user;
    let exchange;

    beforeEach(async () => {
        [owner, user] = await ethers.getSigners();
        console.log("owner  address is :",owner.address)
        console.log("user  address is :",user.address)

        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("Token", "TKN", toWei(1000000));
        await token.deployed();

        const Exchange = await ethers.getContractFactory("Exchange");
        exchange = await Exchange.deploy(token.address);
        await exchange.deployed();
        const userEtherBalanceBefore = await getBalance(owner.address);
        const userTokenBalanceBefore = await token.balanceOf(owner.address);

    })

    it("is deployed", async () => {
        expect(await exchange.deployed()).to.equal(exchange);
    });

    // describe("addLiquidity", async () => {
    //     it('adds liquidity', async () => {
    //         await token.approve(exchange.address, toWei(200));
    //         await exchange.addLiquidity(toWei(200), {value: toWei(100)});
    //
    //         expect(await getBalance(exchange.address)).to.equal(toWei(100));
    //         expect(await exchange.getReserve()).to.equal(toWei(200));
    //     });
    //
    //     it('mint LP tokens', async function () {
    //         await token.approve(exchange.address, toWei(200));
    //         await exchange.addLiquidity(toWei(200), {value: toWei(100)});
    //         expect(await exchange.balanceOf(owner.address)).to.eq(toWei(100));
    //         expect(await exchange.totalSupply()).to.eq(toWei(100));
    //     });
    //
    //     it('allow zero amounts', async function () {
    //         await token.approve(exchange.address, 0);
    //         await exchange.addLiquidity(0, { value: 0});
    //         expect(await getBalance(exchange.address)).to.equal(0);
    //         expect(await exchange.getReserve()).to.equal(0);
    //     });
    // })

    // describe("existing reserves", async () => {
    //     beforeEach(async () => {
    //         await token.approve(exchange.address, toWei(300));
    //         await exchange.addLiquidity(toWei(200), { value: toWei(100) });
    //         // console.log("Token exchange ",(await token.balanceOf(exchange.address)).toString());
    //         // console.log("Eth exchange ",(await getBalance(exchange.address)).toString());
    //         // console.log("Liquidity owner ",(await exchange.balanceOf(owner.address)).toString());
    //
    //         // await token.transfer(user.address, toWei(1000));
    //         // console.log("user balance is  ",(await token.balanceOf(user.address)).toString());
    //         // await token.connect(user).approve(exchange.address, toWei(1000));
    //         // await exchange.connect(user).addLiquidity(toWei(700), { value: toWei(300) });
    //         // console.log("Token exchange ",(await token.balanceOf(exchange.address)).toString());
    //         // console.log("Eth exchange ",(await getBalance(exchange.address)).toString());
    //         // console.log("Liquidity user ",(await exchange.balanceOf(user.address)).toString());
    //     });
    //
    //     it("preserves exchange rate", async () => {
    //         await exchange.addLiquidity(toWei(200), { value: toWei(50) });
    //
    //         expect(await getBalance(exchange.address)).to.equal(toWei(150));
    //         expect(await exchange.getReserve()).to.equal(toWei(300));
    //     });
    //
    //     it("mints LP tokens", async () => {
    //         await exchange.addLiquidity(toWei(200), { value: toWei(50) });
    //
    //         expect(await exchange.balanceOf(owner.address)).to.eq(toWei(150));
    //         expect(await exchange.totalSupply()).to.eq(toWei(150));
    //     });
    //
    //     it("fails when not enough tokens", async () => {
    //         await expect(
    //             exchange.addLiquidity(toWei(50), { value: toWei(50) })
    //         ).to.be.revertedWith("insufficient token amount");
    //     });
    // })

    describe("removeLiquidity", async () => {
        beforeEach(async () => {
            const suserEtherBalanceBefore = await getBalance(owner.address);
            const suserTokenBalanceBefore = await token.balanceOf(owner.address);
            console.log(`111Before userEtherBalanceBefore is ${suserEtherBalanceBefore}, userTokenBalanceBefore is ${suserTokenBalanceBefore}`);
            await token.approve(exchange.address, toWei(300));
            await exchange.addLiquidity(toWei(200), { value: toWei(100) });
            const userEtherBalanceBefore = await getBalance(owner.address);
            const userTokenBalanceBefore = await token.balanceOf(owner.address);
            console.log(`222Before userEtherBalanceBefore is ${userEtherBalanceBefore}, userTokenBalanceBefore is ${userTokenBalanceBefore}`);
        });

        it('remove some liquidity', async () => {
            const userEtherBalanceBefore = await getBalance(owner.address);
            const userTokenBalanceBefore = await token.balanceOf(owner.address);
            console.log(`Before userEtherBalanceBefore is ${userEtherBalanceBefore}, userTokenBalanceBefore is ${userTokenBalanceBefore}`);
            await exchange.removeLiquidity(toWei(25));

            expect(await exchange.getReserve()).to.equal(toWei(150));
            expect(await getBalance(exchange.address)).to.eq(toWei(75));

            const userEtherBalanceAfter = await getBalance(owner.address);
            const userTokenBalanceAfter = await token.balanceOf(owner.address);
            console.log(`After userEtherBalanceAfter is ${userEtherBalanceAfter}, userTokenBalanceAfter is ${userTokenBalanceAfter}`);

            expect(
                fromWei(userEtherBalanceAfter.sub(userEtherBalanceBefore))
            ).to.equal("24.999932627"); // 25 - gas fees

            expect(
                fromWei(userTokenBalanceAfter.sub(userTokenBalanceBefore))
            ).to.equal("50.0");

        });
    })

    // describe("getTokenAmount", async () => {
    //     it('returns correct token amount', async function () {
    //         await token.approve(exchange.address, toWei(2000));
    //         await exchange.addLiquidity(toWei(2000), { value: toWei(1000) });
    //
    //         let tokensOut = await exchange.getTokenAmount(toWei(1));
    //         expect(fromWei(tokensOut)).to.equal("1.998001998001998001");
    //
    //         tokensOut = await exchange.getTokenAmount(toWei(100));
    //         expect(fromWei(tokensOut)).to.equal("181.818181818181818181");
    //
    //         tokensOut = await exchange.getTokenAmount(toWei(1000));
    //         expect(fromWei(tokensOut)).to.equal("1000.0");
    //     });
    // })
    //
    // describe("getEthAmount", async () => {
    //     it('returns correct ether amount', async function () {
    //         await token.approve(exchange.address, toWei(2000));
    //         await exchange.addLiquidity(toWei(2000), { value: toWei(1000) });
    //
    //         let ethOut = await exchange.getEthAmount(toWei(2));
    //         expect(fromWei(ethOut)).to.equal("0.999000999000999");
    //
    //         ethOut = await exchange.getEthAmount(toWei(100));
    //         expect(fromWei(ethOut)).to.equal("47.619047619047619047");
    //
    //         ethOut = await exchange.getEthAmount(toWei(2000));
    //         expect(fromWei(ethOut)).to.equal("500.0");
    //     });
    // })

})