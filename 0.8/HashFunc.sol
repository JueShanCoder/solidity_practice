// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

contract HashFunc {
    function hash(string memory text, uint num, address addr) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(text,num,addr));
    }

    // 所有不定长都需要加上 
    // encode 会补 0
    function encode(string memory text0, string memory text1) external pure returns (bytes memory) {
        return abi.encode(text0, text1);
    }

    // encodePacked 不会补 0 只是直接取的十六进制
    function encodePacked(string memory text0, string memory text1) external pure returns (bytes memory) {
        return abi.encodePacked(text0, text1);
    }

    // hash 碰撞 
    // 通过 abi.encode 解决
    // 或在两个字符串中间添加 uint 隔开
    function collision(string memory text0, string memory text1) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(text0, text1));
    }
}