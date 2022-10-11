// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

contract Counter {
    uint public count;

    function inc() external {
        count += 1;
    }

    function sub() external {
        count -= 1;
    }
}