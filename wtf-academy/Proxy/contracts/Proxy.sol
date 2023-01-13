pragma solidity ^0.8.0;

contract Proxy {
    // 逻辑合约地址
    address public implementation;

    constructor(address implementation_) {
        implementation = implementation_;
    }

    fallback() external payable {
        address _implementation = implementation;
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), _implementation, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())

            switch result
            case 0 {
                revert(0, returndatasize())
            }

            default {
                return(0, returndatasize())
            }
        }
    }
}
