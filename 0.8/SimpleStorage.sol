// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

contract SimpleStorage {
    string public text;

    // aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    // calldata 89578 gas
    // memory   90066 gas
    function set(string memory _text) external {
        text = _text;
    }

    function get() external view returns (string memory) {
        return text;
    }

}