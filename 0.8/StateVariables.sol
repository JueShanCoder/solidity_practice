// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

contract StateVariables {
    uint public myUint = 123;
    function foo() external pure{
        uint notStateVariable = 456;
    }
}