// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

interface IERC20 {
    // 代币发行总量
    function totalSupply() external view returns (uint);
    // 查询某个账户的代币余额
    function balanceOf(address account) external view returns (uint);
    // 从当前的自己账户，实现代币的交易
    function transfer(address recipient, uint amount) external returns (bool);

    // 查询某个账户可转账金额。用于控制代币的交易
    function allowance(address owner, address spender) external view returns (uint);

    // 设置允许某个账户 soender 从此地址可使用的代币数
    function approve(address spender, uint amount) external returns (bool);

    // 实现用户之间的代币交易
    function transferFrom(address sender, address recipient, uint amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint amount);
    event Approval(address indexed owner, address indexed spender, uint amount);
}

contract ERC20 is IERC20 {
    uint public totalSupply;
    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;

    // token 名称
    string public name = "Test";
    // token 的缩写或符号
    string public symbol = "TEST";
    // token 的精度
    uint public decimals = 18;

    // 代表把账户中的余额由当前调用者发送到另一个账户中。
    function transfer(address recipient, uint amount) external returns (bool) { 
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    // 对另一账户进行批准额度
    function approve(address spender, uint amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    // 向另一个合约存款时，另一个合约必须调用 transferFrom 方法才可以获取调用方的 token
    function transferFrom(address sender, address recipient, uint amount) external returns (bool) {
        // A => B approve B.transferFrom => allowance[B][A] -= amount 
        allowance[sender][msg.sender] -= amount;
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function mint(uint amount) external {
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function burn(uint amount) external {
         balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
}