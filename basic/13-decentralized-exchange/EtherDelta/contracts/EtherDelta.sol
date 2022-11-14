pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// ERC20 合约
contract Token {

    uint256 public decimals;
    string public name;

    function balanceOf(address _owner) public view virtual returns (uint256 balance) {}

    function transfer(address _to, uint256 _value) public virtual returns (bool success) {}

    function transferFrom(address _from, address _to, uint256 _value) public virtual returns (bool success) {}

    function approve(address _spender, uint256 _value) public virtual returns (bool success) {}

    function allowance(address _owner, address _spender)
        public
        view
        virtual
        returns (uint256 remaining) {}

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );
}

// 实现类似 ERC20 合约
contract StandardToken is Token {

    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowed;

    uint256 public totalSupply;

    function transfer(address _to, uint256 _value) public virtual override returns (bool success) {
        if (balances[msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
            balances[msg.sender] -= _value;
            balances[_to] += _value;
            emit Transfer(msg.sender, _to, _value);
            return true;
        }
        return false;
    }

    function transferFrom(address _from, address _to, uint256 _value) public virtual override returns (bool success) {
        if (
            // 判断授权账户余额足够
            balances[_from] >= _value &&
            // 判断被授权账户的对应授权额度是否足够
            allowed[_from][msg.sender] >= _value &&
            // 防止出现 uint 越界情况
            balances[_to] + _value > balances[_to] &&
            _value > 0
        ) {
            balances[_to] += _value;
            balances[_from] -= _value;
            allowed[_from][msg.sender] -= _value;
            emit Transfer(_from, _to, _value);
            return true;
        }
        return false;
    }

    function balanceOf(address _owner) public view override returns (uint256 balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint256 _value) public override returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public view override returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }
}

// 实现简单的 token 合约，类似 ERC20 标准合约，用于交易所内的 token 交易（非 eth）
contract ReserveToken is StandardToken {
    address public minter;

    constructor() {
        minter = msg.sender;
    }

    function create(address account, uint256 amount) public {
        require(msg.sender == minter, "No permission");
        balances[account] = SafeMath.add(balances[account], amount);
        totalSupply = SafeMath.add(totalSupply, amount);
    }

    function destory(address account, uint256 amount) public {
        require(msg.sender == minter, "No permission");
        require(balances[account] >= amount, "amount is not enough");
        balances[account] = SafeMath.sub(totalSupply, amount);
    }
}

// 内部维护一张 VIP 等级列表，管理员可以设置用户的 vip 等级
contract AccountLevels {
    // given a user, returns an account level
    // 0 regular user (pays take fee and make fee)
    // 1 market maker silver (pays take fee, no make fee, gets rebate)
    // 2 market maker gold (pays take fee, no make fee, gets entire counterparty's take fee as rebate)
    function accountLevel(address user) public view virtual returns (uint256) {}
}

contract AccountLevelsTest is AccountLevels {
    mapping(address => uint256) public accountLevels;

    function setAccountLevel(address user, uint256 level) public {
        accountLevels[user] = level;
    }

    function accountLevel(address user) public view override returns (uint256) {
        return accountLevels[user];
    }
}

// 交易所核心合约
// 用户交易用的资产必须先存入（ deposit() ）交易合约，交易完成后，可以提现（ withdraw() ）到自己钱包，基本和中心化交易所流程相同
contract EtherDelta {
    using SafeMath for *;

    // 管理员地址
    address public admin;
    // 手续费账户
    address public feeAccount;
    // AccountLevelsTest 合约地址
    address public accountLevelsAddr;
    // 买入手续费率
    uint256 public feeMake;
    // 卖出手续费率
    uint256 public feeTake;
    // VIP 佣金回扣费率
    uint256 public feeRebate;

    // token 用户持有每种 token 数量的列表（0 地址 代表 Ether）
    mapping(address => mapping(address => uint256)) public tokens;
    // 挂单列表（true = 用户提交的挂单，需要验证离线签名）
    mapping(address => mapping(bytes32 => bool)) public orders;
    // 每一笔挂单完成的数量
    mapping(address => mapping(bytes32 => uint256)) public orderFills;

    struct OrderSigned {
        // token 支出的地址
        address tokenGet;
        // amount 支出的地址
        uint256 amountGet;
        // 收入 token 的地址
        address tokenGive;
        // 收入 amount 的地址
        uint256 amountGive;
        // 超时时间
        uint256 expires;
        // 随机数
        uint256 nonce;
        // 用户地址
        address user;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    event Order(
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 expires,
        uint256 nonce,
        address user
    );

    event Cancel(
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 expires,
        uint256 nonce,
        address user,
        uint8 v,
        bytes32 r,
        bytes32 s
    );

    event Trade(
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address get,
        address give
    );

    event Deposit(address token, address user, uint256 amount, uint256 balance);

    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );

    modifier adminOnly() {
        require(msg.sender == admin, "No permission");
        _;
    }

    constructor(
        address admin_,
        address feeAccount_,
        address accountLevelsAddr_,
        uint256 feeMake_,
        uint256 feeTake_,
        uint256 feeRebate_
    ) {
        admin = admin_;
        feeAccount = feeAccount_;
        accountLevelsAddr = accountLevelsAddr_;
        feeMake = feeMake_;
        feeTake = feeTake_;
        feeRebate = feeRebate_;
    }

    function changeAdmin(address admin_) public adminOnly {
        admin = admin_;
    }

    function changeAccountLevelAddr(address accountLevelAddr_) public adminOnly {
        accountLevelAddr_ = accountLevelAddr_;
    }

    function changeFeeAccount(address feeAccount_) public adminOnly {
        feeAccount = feeAccount_;
    }

    function changeFeeMake(uint256 feeMake_) public adminOnly {
        require(feeMake_ <= feeMake);
        feeMake = feeMake_;
    }

    function changeFeeTake(uint256 feeTake_) public adminOnly {
        require(feeTake_ <= feeTake && feeTake_ >= feeRebate);
        feeTake = feeTake_;
    }

    function changeFeeRebate(uint256 feeRebate_) public adminOnly {
        require(feeRebate_ >= feeRebate && feeRebate_ <= feeTake);
        feeRebate = feeRebate_;
    }

    function deposit() public payable {
        tokens[address(0)][msg.sender] = SafeMath.add(
            tokens[address(0)][msg.sender],
            msg.value
        );

        emit Deposit(address(0), msg.sender, msg.value, tokens[address(0)][msg.sender]);
    }

    // 交易完成，可提现
    function withdraw(uint256 amount) public {
        require(tokens[address(0)][msg.sender] >= amount);
        tokens[address(0)][msg.sender] = SafeMath.sub(
            tokens[address(0)][msg.sender],
            amount
        );
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "withdraw failed.");
        emit Withdraw(address(0), msg.sender, amount, tokens[address(0)][msg.sender]);
    }

    function depositToken(address token, uint256 amount) public {
        require(token != address(0));
        require(Token(token).transferFrom(msg.sender, address(this), amount), "Token.transferFrom failed.");
        tokens[token][msg.sender] = SafeMath.add(
            tokens[token][msg.sender],
            amount
        );
        emit Deposit(token, msg.sender, amount, tokens[token][msg.sender]);
    }

    function withdrawToken(address token, uint256 amount) public {
        require(token != address(0));
        require(tokens[token][msg.sender] >= amount);
        tokens[token][msg.sender] = SafeMath.sub(
            tokens[token][msg.sender],
            amount
        );
        require(Token(token).transfer(msg.sender, amount));
        emit Withdraw(token, msg.sender, amount, tokens[token][msg.sender]);
    }

    function balanceOf(address token, address user) public view returns (uint256) {
        return tokens[token][user];
    }

    function order(
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 expires,
        uint256 nonce
    ) public {
        bytes32 hash = keccak256(
            abi.encodePacked(
                address(this),
                tokenGet,
                amountGet,
                tokenGive,
                amountGive,
                expires,
                nonce
            )
        );
        orders[msg.sender][hash] = true;
        emit Order(
            tokenGet,
            amountGet,
            tokenGive,
            amountGive,
            expires,
            nonce,
            msg.sender
        );
    }

    function trade(OrderSigned memory orderSigned, uint256 amount) public {
        bytes32 hash = keccak256(
            abi.encodePacked(
                address(this),
                orderSigned.tokenGet,
                orderSigned.amountGet,
                orderSigned.tokenGive,
                orderSigned.amountGive,
                orderSigned.expires,
                orderSigned.nonce
            )
        );

        require(
            ((
                orders[orderSigned.user][hash] ||
                ecrecover(
                    keccak256(
                        abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
                    ),
                    orderSigned.v,
                    orderSigned.r,
                    orderSigned.s
                ) == orderSigned.user) &&
                block.number <= orderSigned.expires &&
                SafeMath.add(orderFills[orderSigned.user][hash], amount) <= orderSigned.amountGet
            ),"permit not pass"
        );

        tradeBalances(
            orderSigned.tokenGet,
            orderSigned.amountGet,
            orderSigned.tokenGive,
            orderSigned.amountGive,
            orderSigned.user,
            amount
        );

        orderFills[orderSigned.user][hash] = SafeMath.add(
            orderFills[orderSigned.user][hash],
            amount
        );

        emit Trade(
            orderSigned.tokenGet,
            amount,
            orderSigned.tokenGive,
            (orderSigned.amountGive * amount) / orderSigned.amountGet,
            orderSigned.user,
            msg.sender
        );
    }

    function tradeBalances(
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address user,
        uint256 amount
    ) private {
        // 买入手续费
        uint256 feeMakeXfer = SafeMath.mul(amount, feeMake) / (1 ether);
        // 卖出手续费
        uint256 feeTakeXfer = SafeMath.mul(amount, feeTake) / (1 ether);
        uint256 feeRebateXfer = 0;

        if (accountLevelsAddr != address(0)) {
            uint256 accountLevel = AccountLevels(accountLevelsAddr).accountLevel(user);
            if (accountLevel == 1) {
                feeRebateXfer = SafeMath.mul(amount, feeRebate) / (1 ether);
            }
            if (accountLevel == 2) {
                feeRebateXfer = feeTakeXfer;
            }
        }
        tokens[tokenGet][msg.sender]= SafeMath.sub(
            tokens[tokenGet][msg.sender],
            SafeMath.add(amount, feeTakeXfer)
        );

        tokens[tokenGet][user] = SafeMath.add(
            tokens[tokenGet][user],
            SafeMath.sub(SafeMath.add(amount, feeRebateXfer), feeMakeXfer)
        );

        tokens[tokenGet][feeAccount] = SafeMath.add(
            tokens[tokenGet][feeAccount],
            SafeMath.sub(SafeMath.add(feeMakeXfer, feeTakeXfer), feeRebateXfer)
        );

        tokens[tokenGive][user] = SafeMath.sub(
            tokens[tokenGive][user],
            SafeMath.mul(amountGive, amount) / amountGet
        );

        tokens[tokenGive][msg.sender] = SafeMath.add(
            tokens[tokenGive][msg.sender],
            SafeMath.mul(amountGive, amount) / amountGet
        );
    }

    function availableVolume(OrderSigned memory orderSigned) public view returns (uint256) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                address(this),
                orderSigned.tokenGet,
                orderSigned.amountGet,
                orderSigned.tokenGive,
                orderSigned.amountGive,
                orderSigned.expires,
                orderSigned.nonce
            )
        );
        if (
            !((orders[orderSigned.user][hash] ||
        ecrecover(
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
            ),
            orderSigned.v,
            orderSigned.r,
            orderSigned.s
        ) ==
        orderSigned.user) && block.number <= orderSigned.expires)
        ) return 0;

        uint256 available1 = SafeMath.sub(
            orderSigned.amountGet,
            orderFills[orderSigned.user][hash]
        );
        uint256 available2 = SafeMath.mul(
            tokens[orderSigned.tokenGive][orderSigned.user],
            orderSigned.amountGet
        ) / orderSigned.amountGive;
        if (available1 < available2) return available1;
        return available2;
    }

    function amountFilled(OrderSigned memory orderSigned) public view returns (uint256)
    {
        bytes32 hash = keccak256(
            abi.encodePacked(
                address(this),
                orderSigned.tokenGet,
                orderSigned.amountGet,
                orderSigned.tokenGive,
                orderSigned.amountGive,
                orderSigned.expires,
                orderSigned.nonce
            )
        );
        return orderFills[orderSigned.user][hash];
    }

    function cancelOrder(OrderSigned memory orderSigned) public {
        bytes32 hash = keccak256(
            abi.encodePacked(
                address(this),
                orderSigned.tokenGet,
                orderSigned.amountGet,
                orderSigned.tokenGive,
                orderSigned.amountGive,
                orderSigned.expires,
                orderSigned.nonce
            )
        );
        require(
            (orders[msg.sender][hash] ||
        ecrecover(
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
            ),
            orderSigned.v,
            orderSigned.r,
            orderSigned.s
        ) ==
        msg.sender)
        );
        orderFills[msg.sender][hash] = orderSigned.amountGet;
        emit Cancel(
            orderSigned.tokenGet,
            orderSigned.amountGet,
            orderSigned.tokenGive,
            orderSigned.amountGive,
            orderSigned.expires,
            orderSigned.nonce,
            msg.sender,
            orderSigned.v,
            orderSigned.r,
            orderSigned.s
        );
    }
}

