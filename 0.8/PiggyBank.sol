// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

contract PiggyBank {
    address public owner = msg.sender;

    event Deposit(address sender, uint amount);
    event Withdraw(uint amount);

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw() external {
        require(msg.sender == owner, "not owner");
        emit Withdraw(address(this).balance);
        selfdestruct(payable(msg.sender));
    }
}