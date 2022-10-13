// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

contract TestDelegateCall {
    uint public num;
    address public sender;
    uint public value;

    function setVars(uint _num) external payable {
        num = 2 *_num;
        sender = msg.sender;
        value = msg.value;
    }
}

contract DelegateCall {
    // 委托调用合约位置和被调用合约位置需要保持一致
    uint public num;
    address public sender;
    uint public value;

    function setVars(address _test, uint _num) external payable {
        // _test.delegatecall(
        //     abi.encodeWithSignature("setVars(uint256)", _num)
        // );

        (bool success, bytes memory data) = _test.delegatecall(
            abi.encodeWithSelector(TestDelegateCall.setVars.selector, _num)
        );
        require(success, "delegatecall failed");
    }
}