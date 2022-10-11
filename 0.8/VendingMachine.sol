// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

// custom error
contract VendingMachine {
    address payable owner = payable(msg.sender);

    error Unauthorized(address caller);

    function withdraw() public {
        if (msg.sender != owner) revert Unauthorized(msg.sender);

        owner.transfer(address(this).balance);
    }
}
