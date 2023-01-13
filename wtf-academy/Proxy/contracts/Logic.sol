pragma solidity ^0.8.0;

contract Logic {
    address public implementation;

    uint public x = 99;
    event CallSuccess();

    function increment() external returns(uint) {
        emit CallSuccess();
        return x + 1;
    }
}
