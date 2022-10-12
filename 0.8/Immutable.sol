// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

contract Immutable {
    address public immutable owner;

    uint public x;

    constructor() {
        owner = msg.sender;
    }

    function foo() external {
        require(msg.sender == owner);
        x += 1;
    }
}