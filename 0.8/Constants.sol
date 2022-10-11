// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

// 21442 gas
contract Constants {
    address public constant MY_ADDRESS = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
    uint public constant MY_UINT = 123;
}

// 23553 gas
contract Var {
    address public MY_ADDRESS = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
}