// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

contract Proxy {
    event Deploy(address);

    function deploy(bytes memory _code) external payable returns (address addr) {
        assembly {
            // create(v,p,n)
            // v = amount of ETH to send 部署合约发送到以太坊主币的数量
            // p = pointer in memory to start of code 内存中机器码开始的位置
            // n = size of code 内存中整个机器码的大小
            addr := create(callvalue(), add(_code, 0x20), mload(_code))
        }
        require(addr != address(0), "deploy failed");
    }
}