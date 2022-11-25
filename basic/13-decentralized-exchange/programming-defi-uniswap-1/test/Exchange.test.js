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
            await token.approve(exchange.address, toWei(300));
            await exchange.addLiquidity(toWei(200), { value: toWei(100) });
            const userEtherBalanceBefore = await getBalance(owner.address);
            const userTokenBalanceBefore = await token.balanceOf(owner.address);
            const exchangeTokenBalanceBefore = await token.balanceOf(exchange.address);
            console.log(`222Before userEtherBalanceBefore is ${userEtherBalanceBefore},
             userTokenBalanceBefore is ${userTokenBalanceBefore}, exchangeTokenBalanceBefore is ${exchangeTokenBalanceBefore}`);
        });

        // it('remove some liquidity', async () => {
        //     const userEtherBalanceBefore = await getBalance(owner.address);
        //     const userTokenBalanceBefore = await token.balanceOf(owner.address);
        //     console.log(`Before userEtherBalanceBefore is ${userEtherBalanceBefore}, userTokenBalanceBefore is ${userTokenBalanceBefore}`);
        //     await exchange.removeLiquidity(toWei(25));
        //
        //     expect(await exchange.getReserve()).to.equal(toWei(150));
        //     expect(await getBalance(exchange.address)).to.eq(toWei(75));
        //
        //     const userEtherBalanceAfter = await getBalance(owner.address);
        //     const userTokenBalanceAfter = await token.balanceOf(owner.address);
        //     console.log(`After userEtherBalanceAfter is ${userEtherBalanceAfter}, userTokenBalanceAfter is ${userTokenBalanceAfter}`);
        //
        //     expect(
        //         fromWei(userEtherBalanceAfter.sub(userEtherBalanceBefore))
        //     ).to.equal("24.999932627"); // 25 - gas fees
        //
        //     expect(
        //         fromWei(userTokenBalanceAfter.sub(userTokenBalanceBefore))
        //     ).to.equal("50.0");
        // });
        //
        // it('remove all liquidity', async () => {
        //     const userEtherBalanceBefore = await getBalance(owner.address);
        //     const userTokenBalanceBefore = await token.balanceOf(owner.address);
        //
        //     await exchange.removeLiquidity(toWei(100));
        //
        //     expect(await exchange.getReserve()).to.equal(toWei(0));
        //     expect(await getBalance(exchange.address)).to.equal(toWei(0));
        //
        //     const userEtherBalanceAfter = await getBalance(owner.address);
        //     const userTokenBalanceAfter = await token.balanceOf(owner.address);
        //
        //     expect(fromWei(userEtherBalanceAfter.sub(userEtherBalanceBefore))).to.equal("99.999946101");
        //
        //     expect(fromWei(userTokenBalanceAfter.sub(userTokenBalanceBefore))).to.equal("200.0");
        // });

        it('pays for provided liquidity', async () => {
            const userEtherBalanceBefore = await getBalance(owner.address);
            const userTokenBalanceBefore = await token.balanceOf(owner.address);

            console.log(`before user token is `,await token.balanceOf(user.address));
            console.log(`before exchange token is `,fromWei(await token.balanceOf(exchange.address)));
            console.log("---------------------------------------------------")
            console.log(`before user eth is `,await getBalance(user.address));
            console.log(`before exchange eth is `,await getBalance(exchange.address));
            await exchange.connect(user).ethToTokenSwap(toWei(18), { value:toWei(10) });

            console.log(`after user token is `,fromWei(await token.balanceOf(user.address)));
            console.log(`after exchange token is `,fromWei(await token.balanceOf(exchange.address)));
            console.log("---------------------------------------------------")
            console.log(`after user eth is `, await getBalance(user.address));
            console.log(`after exchange eth is `, await getBalance(exchange.address));

            console.log("---------------------------------------------------")
            console.log(`before removeLiquidity owner eth is `, fromWei(await getBalance(owner.address)));
            console.log(`before removeLiquidity owner token is `, await token.balanceOf(owner.address));
            await exchange.removeLiquidity(toWei(100));

            console.log(`after removeLiquidity exchange eth is `,fromWei(await getBalance(exchange.address)))
            console.log(`after removeLiquidity owner eth is `,fromWei(await getBalance(owner.address)))
            console.log(`after removeLiquidity owner token is `, await token.balanceOf(owner.address));
            expect(await exchange.getReserve()).to.equal(toWei(0));
            expect(await getBalance(exchange.address)).to.equal(toWei(0));
            expect(fromWei(await token.balanceOf(user.address))).to.equal(
                "18.01637852593266606"
            );

            const userEtherBalanceAfter = await getBalance(owner.address);
            const userTokenBalanceAfter = await token.balanceOf(owner.address);

            expect(fromWei(userEtherBalanceAfter.sub(userEtherBalanceBefore))).to.equal("109.999946101");

            expect(fromWei(userTokenBalanceAfter.sub(userTokenBalanceBefore))).to.equal("181.98362147406733394");
        });

        it('burns LP-tokens', async () => {
            await expect(() => {
                exchange.removeLiquidity(toWei(25));
            }).to.changeTokenBalance(exchange, owner, toWei(-25));
        });

        it("doesn't allow invalid amount", async () => {
            await expect(exchange.removeLiquidity(toWei(100.1))).to.be.revertedWith(
                "burn amount exceeds balance"
            );
        });
    })

    describe("getTokenAmount", async () => {
        it('returns correct token amount', async function () {
            await token.approve(exchange.address, toWei(2000));
            await exchange.addLiquidity(toWei(2000), { value: toWei(1000) });

            let tokensOut = await exchange.getTokenAmount(toWei(1));
            expect(fromWei(tokensOut)).to.equal("1.978041738678708079");

            tokensOut = await exchange.getTokenAmount(toWei(100));
            expect(fromWei(tokensOut)).to.equal("180.1637852593266606");

            tokensOut = await exchange.getTokenAmount(toWei(1000));
            expect(fromWei(tokensOut)).to.equal("994.974874371859296482");
        });
    })

    describe("getEthAmount", async () => {
        it('returns correct ether amount', async function () {
            await token.approve(exchange.address, toWei(2000));
            await exchange.addLiquidity(toWei(2000), { value: toWei(1000) });

            let ethOut = await exchange.getEthAmount(toWei(2));
            expect(fromWei(ethOut)).to.equal("0.989020869339354039");

            ethOut = await exchange.getEthAmount(toWei(100));
            expect(fromWei(ethOut)).to.equal("47.16531681753215817");

            ethOut = await exchange.getEthAmount(toWei(2000));
            expect(fromWei(ethOut)).to.equal("497.487437185929648241");
        });
    })

    describe("ethToTokenSwap", async () => {
        beforeEach(async () => {
            await token.approve(exchange.address, toWei(2000));
            await exchange.addLiquidity(toWei(2000), { value: toWei(1000) });
        });

        it("transfers at least min amount of tokens", async () => {
            const userBalanceBefore = await getBalance(user.address);

            await exchange
                .connect(user)
                .ethToTokenSwap(toWei(1.97), { value: toWei(1) });
        });

    })

})