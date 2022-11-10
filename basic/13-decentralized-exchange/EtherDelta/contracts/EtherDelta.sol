pragma solidity ^0.8.0;

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
        returns (uint256 remaining)
    {}

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );
}

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
}