pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../../../../0.8/SafeMath.sol";

// ERC20 合约
contract Token {

    uint256 public decimals;
    string public name;

    function balanceOf(address _owner) public view virtual returns (uint256 balance) {}

    function transfer(address _to, uint256 _value) public view virtual returns (bool success) {}

    function transferFrom(address _from, address _to, uint256 _value) public view virtual returns (bool success) {}

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

    function transfer(address _to, uint256 _value) public override returns (bool success) {
        if (balances[msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
            balances[msg.sender] -= _value;
            balances[_to] += _value;
            emit Transfer(msg.sender, _to, _value);
            return true;
        }
        return false;
    }

    function transferFrom(address _from, address _to, uint256 _value) public override returns (bool success) {
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

contract AccountLevelTest is AccountLevels {
    mapping(address => uint256) public accountLevels;

    function setAccountLevel(address user, uint256 level) public {
        accountLevels[user] = level;
    }

    function accountLevel(address user) public view override returns (uint256) {
        return accountLevels[user];
    }
}

// 交易所核心合约
// 用户交易用的资产必须先存入（ desposit() ）交易合约，交易完成后，可以提现（ withdraw() ）到自己钱包，基本和中心化交易所流程相同
contract EtherDelta {
    using SafeMath for *;

    // 管理员地址
    address public admin;
    // 手续费账户
    address public feeAccount;
    //
    address public accountLevelsAddr;
    //
    uint256 public feeMake;
    //
    uint256 public feeTake;
    //
    uint256 public feeRebate;

    // 将 Token 映射到 balance
    mapping(address => mapping(address => uint256)) public tokens;
    // 卖家挂单 order()，以挂单信息转换为 hash，作为键，存入 orders 合约变量
    // 返回 true 表示用户提交，相当于链签名
    mapping(address => mapping(bytes32 => bool)) public orders;
    // 已填充的订单数量
    mapping(address => mapping(bytes32 => uint256)) public orderFills;

    struct OrderSigned {
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 expires;
        uint256 nonce;
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
        uint256
    )
}