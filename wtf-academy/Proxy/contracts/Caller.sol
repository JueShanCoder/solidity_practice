pragma solidity ^0.8.0;

contract Caller {
    address public proxy;

    constructor(address proxy_) {
        proxy = proxy_;
    }

    function increment() external returns(uint) {
        (, bytes memory data) = proxy.call(abi.encodeWithSignature("increment()"));
        return abi.decode(data, (uint));
    }
}
