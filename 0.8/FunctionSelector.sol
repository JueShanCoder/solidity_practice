// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

contract FunctionSelector {
    function getSelector(string calldata _func) external pure returns (bytes4) {
        return bytes4(keccak256(bytes(_func)));
    }
}

contract Receiver {
    event Log(bytes data);

    function transfer(address _to, uint _amount) external {
        emit Log(msg.data);
    }
    // 0xa9059cbb 4 字节 - 函数名称和参数类型打包取 hash 值前 4 位
    // 0000000000000000000000004b20993bc481177ec7e8f571cecae8a9e22c02db 16 字节入参 地址
    // 000000000000000000000000000000000000000000000000000000000000000b 16 字节入参 数量
}