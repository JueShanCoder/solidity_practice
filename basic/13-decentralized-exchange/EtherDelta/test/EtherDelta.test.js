require("@nomiclabs/hardhat-waffle")
const { expect } = require("chai")

const fs = require("fs")
const testAccounts = JSON.parse(fs.readFileSync("./testAccounts.json"))

const { BigNumber, utils, provider } = ethers
const {
    solidityPack,
    concat,
    toUtf8Bytes,
    keccak256,
    SigningKey,
    formatBytes32String
} = utils

const toWei = (value) => utils.parseEther(value.toString())
const fromWei = (value) => utils.formatEther(typeof value === "string" ? value : value.toString())
const getBalance = provider.getBalance
const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000"

describe("EtherDelta", () => {
    // 手续费账户
    let feeAccount
    // 管理员地址
    let admin
    // 买入手续费率
    let feeMake
    // 卖出手续费率
    let feeTake
    // VIP 佣金回扣费率
    let feeRebate

    let token1
    let token2
    let accountLevelsTest
    let etherDelta

    beforeEach(async () => {
        [owner, user1, user2] = await ethers.getSigners()
        // 加载 privateKey
        owner.privateKey = testAccounts[0]
        user1.privateKey = testAccounts[1]
        user2.privateKey = testAccounts[2]

        feeAccount = owner.address
        admin = owner.address

        console.log('Owner address is ', owner.address)
        console.log('user1 address is ', user1.address)
        console.log('user2 address is ', user2.address)
        // 买家佣金费率
        feeMake = toWei(0.0005)
        // 卖家佣金费率
        feeTake = toWei(0.003)
        // 会员返佣费率
        feeRebate = toWei(0.002)

        // ReserveToken
        const ReserveToken = await ethers.getContractFactory("ReserveToken")
        // token1
        token1 = await ReserveToken.deploy()
        await token1.deployed()

        // token2
        token2 = await ReserveToken.deploy()
        await token2.deployed()

        // AccountLevelTest
        const AccountLevelsTest = await ethers.getContractFactory("AccountLevelsTest")
        accountLevelsTest = await AccountLevelsTest.deploy()
        await accountLevelsTest.deployed()

        const EtherDelta = await ethers.getContractFactory("EtherDelta")

        etherDelta = await EtherDelta.deploy(
            admin,
            feeAccount,
            accountLevelsTest.address,
            feeMake,
            feeTake,
            feeRebate
        )
        await etherDelta.deployed()
    })

    // it('it deployed', async () => {
    //     expect(await token1.deployed()).to.equal(token1)
    //     expect(await token2.deployed()).to.equal(token2)
    //     expect(await accountLevelsTest.deployed()).to.equal(accountLevelsTest)
    //     expect(await etherDelta.deployed()).to.equal(etherDelta)
    // })

    // it('should mint some tokens', async () => {
    //     const amount = toWei(10000)
    //
    //     // token1
    //     await token1.create(user1.address, amount)
    //     expect(await token1.balanceOf(user1.address)).to.equal(amount)
    //     expect(await token1.totalSupply()).to.equal(amount)
    //
    //     // token2
    //     await token2.create(user1.address, amount)
    //     expect(await token2.balanceOf(user1.address)).to.equal(amount)
    //     expect(await token2.totalSupply()).to.equal(amount)
    // })

    // it('should add funds to etherdelta', async () => {
    //     const amount = toWei(1000)
    //     console.log(`amount: ${amount}`)
    //     console.log('balance', (await user1.getBalance()))
    //     // deposit eth
    //     await etherDelta.connect(user1).deposit({ value: amount })
    //     console.log('balance', (await user1.getBalance()))
    //     expect(await etherDelta.balanceOf(ADDRESS_ZERO, user1.address)).to.equal(
    //         amount
    //     )
    //
    //     // deposit token1
    //     await token1.create(user1.address, amount)
    //     await token1.connect(user1).approve(etherDelta.address, amount)
    //     console.log(`etherDelta address is : ${etherDelta.address}`)
    //     console.log(`token1 address is : ${token1.address}`)
    //     const etherDelaToken = await token1.connect(user1).balanceOf(etherDelta.address)
    //     console.log('Before etherDelaToken is ', await etherDelaToken.toString())
    //
    //     await etherDelta.connect(user1).depositToken(token1.address, amount)
    //
    //     const etherDelaToken2 = await token1.connect(user1).balanceOf(etherDelta.address)
    //     console.log('After etherDelaToken is ', await etherDelaToken2.toString())
    //     expect(await etherDelta.balanceOf(token1.address, user1.address)).to.equal(
    //         amount
    //     )
    //
    //     // deposit token2
    //     await token2.create(user1.address, amount)
    //     await token2.connect(user1).approve(etherDelta.address, amount)
    //     await etherDelta.connect(user1).depositToken(token2.address, amount)
    //     expect(await etherDelta.balanceOf(token2.address, user1.address)).to.equal(
    //         amount
    //     )
    // })

    // 交易前为账户准备 token 并向交易所授权，存入
    async function prepareTokens() {
        const _tokenAmountInit = toWei(100000)
        console.log(`tokenAmountInit: ${_tokenAmountInit}`)
        console.log(`ether: ${etherDelta.address}`)

        await etherDelta.connect(user1).deposit({ value: toWei(100) })
        await etherDelta.connect(user2).deposit({ value: toWei(100) })

        // token1: [etherDelta] =  _tokenAmountInit
        // tokens: [token1][user1] = _tokenAmountInit
        await token1.create(user1.address, _tokenAmountInit)
        await token1.connect(user1).approve(etherDelta.address, _tokenAmountInit)
        await etherDelta
            .connect(user1)
            .depositToken(token1.address, _tokenAmountInit)

        // token2: [etherDelta] =  _tokenAmountInit
        // tokens: [token2][user1] = _tokenAmountInit
        await token2.create(user1.address, _tokenAmountInit)
        await token2.connect(user1).approve(etherDelta.address, _tokenAmountInit)
        await etherDelta
            .connect(user1)
            .depositToken(token2.address, _tokenAmountInit)

        // token1: [etherDelta] =  _tokenAmountInit
        // tokens: [token1][user2] = _tokenAmountInit
        await token1.create(user2.address, _tokenAmountInit)
        await token1.connect(user2).approve(etherDelta.address, _tokenAmountInit)
        await etherDelta
            .connect(user2)
            .depositToken(token1.address, _tokenAmountInit)

        // token2: [etherDelta] =  _tokenAmountInit
        // tokens: [token2][user2] = _tokenAmountInit
        await token2.create(user2.address, _tokenAmountInit)
        await token2.connect(user2).approve(etherDelta.address, _tokenAmountInit)
        await etherDelta
            .connect(user2)
            .depositToken(token2.address, _tokenAmountInit)

        console.log(`token1 ether: ${await token1.balanceOf(etherDelta.address)}`)
        console.log(`token2 ether: ${await token2.balanceOf(etherDelta.address)}`)

    }

    // 查询各个账户余额情况
    async function checkUsersBlance() {
        console.log(`feeAccount: ${feeAccount}`)
        const feeBalance1 = await etherDelta.balanceOf(token1.address, feeAccount)
        const feeBalance2 = await etherDelta.balanceOf(token2.address, feeAccount)

        const balance11 = await etherDelta.balanceOf(token1.address, user1.address)
        const balance12 = await etherDelta.balanceOf(token1.address, user2.address)

        const balance21 = await etherDelta.balanceOf(token2.address, user1.address)
        const balance22 = await etherDelta.balanceOf(token2.address, user2.address)

        console.log(`feeBalance1: ${feeBalance1} \n feeBalance2: ${feeBalance2} \n balance11: ${balance11} \n balance12: ${balance12} \n balance21: ${balance21} \n balance22: ${balance22}`);
        return [
            feeBalance1,
            feeBalance2,
            balance11,
            balance12,
            balance21,
            balance22,
        ]
    }

    // 签名获得 v, r, s
    async function signOrder(
        tokenGet,
        amountGet,
        tokenGive,
        amountGive,
        expires,
        orderNonce,
        user
    ) {
        let hash = keccak256(
            solidityPack(
                [
                    "address",
                    "address",
                    "uint256",
                    "address",
                    "uint256",
                    "uint256",
                    "uint256",
                ],
                [
                    etherDelta.address,
                    tokenGet,
                    amountGet,
                    tokenGive,
                    amountGive,
                    expires,
                    orderNonce,
                ]
            )
        )

        // console.log('hash', hash.length, hash)
        const messagePrefix = "\x19Ethereum Signed Message:\n"
        hash = keccak256(
            concat([toUtf8Bytes(messagePrefix), toUtf8Bytes(String(32)), hash])
        )

        const signingKey = new SigningKey(user.privateKey)
        const signature = signingKey.signDigest(hash)
        const { v, r, s } = signature

        return {
            tokenGet,
            amountGet,
            tokenGive,
            amountGive,
            expires,
            nonce: orderNonce,
            user: user.address,
            v,
            r,
            s,
        }
    }

    it("Should do some trades initiated offchain", async () => {
        await prepareTokens()

        async function testTradeOffChain(
            expiresIn,
            orderNonce,
            tokenGet,
            tokenGive,
            amountGet,
            amountGive,
            amount,
            accountLevel
        ) {
            let expires = await ethers.provider.getBlockNumber()
            expires += expiresIn

            const orderSigned = await signOrder(
                tokenGet,
                amountGet,
                tokenGive,
                amountGive,
                expires,
                orderNonce,
                user1
            )

            await accountLevelsTest.setAccountLevel(user1.address, accountLevel)
            const level = await accountLevelsTest.accountLevel(user1.address)

            const [
                initialFeeBalance1,
                initialFeeBalance2,
                initialBalance11,
                initialBalance12,
                initialBalance21,
                initialBalance22,
            ] = await checkUsersBlance()

            // await etherDelta
            //   .connect(user1)
            //   .order(tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce)

            await etherDelta.connect(user2).trade(orderSigned, amount)

            const [
                feeBalance1,
                feeBalance2,
                balance11,
                balance12,
                balance21,
                balance22,
            ] = await checkUsersBlance()

            const availableVolume = await etherDelta.availableVolume(orderSigned)
            expect(availableVolume).to.equal(amountGet.sub(amount))

            const amountFilled = await etherDelta.amountFilled(orderSigned)
            expect(amountFilled).to.equal(amount)

            const feeMakeXfer = amount.mul(feeMake).div(toWei(1))
            const feeTakeXfer = amount.mul(feeTake).div(toWei(1))
            let feeRebateXfer = 0
            if (Number(level) === 1)
                feeRebateXfer = amount.mul(feeRebate).div(toWei(1))
            if (Number(level) === 2) feeRebateXfer = feeTakeXfer

            expect(
                initialFeeBalance1.add(initialBalance11).add(initialBalance12)
            ).to.equal(feeBalance1.add(balance11).add(balance12))
            expect(
                initialFeeBalance2.add(initialBalance21).add(initialBalance22)
            ).to.equal(feeBalance2.add(balance21).add(balance22))
            expect(feeBalance1.sub(initialFeeBalance1)).to.equal(
                feeMakeXfer.add(feeTakeXfer).sub(feeRebateXfer)
            )
            expect(balance11).to.equal(
                initialBalance11.add(amount).sub(feeMakeXfer).add(feeRebateXfer)
            )
            expect(balance12).to.equal(initialBalance12.sub(amount.add(feeTakeXfer)))
            expect(balance21).to.equal(
                initialBalance21.sub(amount.mul(amountGive).div(amountGet))
            )
            expect(balance22).to.equal(
                initialBalance22.add(amount.mul(amountGive).div(amountGet))
            )
        }

        const trades = [
            {
                expires: 10,
                orderNonce: 1,
                tokenGet: token1.address,
                tokenGive: token2.address,
                amountGet: toWei(50),
                amountGive: toWei(25),
                amount: toWei(25),
                accountLevel: 0,
            },
            {
                expires: 10,
                orderNonce: 2,
                tokenGet: token1.address,
                tokenGive: token2.address,
                amountGet: toWei(50),
                amountGive: toWei(25),
                amount: toWei(25),
                accountLevel: 1,
            },
            {
                expires: 10,
                orderNonce: 3,
                tokenGet: token1.address,
                tokenGive: token2.address,
                amountGet: BigNumber.from(50),
                amountGive: BigNumber.from(25),
                amount: BigNumber.from(25),
                accountLevel: 2,
            },
        ]

        for (let i = 0; i < 1; i++) {
            const trade = trades[i]
            console.log(`trade amount:  ${trade.amount.toString()}`)
            await testTradeOffChain(
                trade.expires,
                trade.orderNonce,
                trade.tokenGet,
                trade.tokenGive,
                trade.amountGet,
                trade.amountGive,
                trade.amount,
                trade.accountLevel
            )
        }
    })
})