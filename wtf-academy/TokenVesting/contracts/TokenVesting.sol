// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TokenVesting {
    event ERC20Released(address indexed token, uint256 amount);

    // 记录已经释放的代币
    mapping(address => uint256) public erc20Released;
    // 受益人地址
    address public immutable beneficiary;
    // 起始时间戳
    uint256 public immutable start;
    // 归属期
    uint256 public immutable duration;

    constructor(address beneficiaryAddress, uint256 durationSeconds) {
        require(beneficiaryAddress != address(0), "VestingWallet: beneficiaryAddress is zero address");
        beneficiary = beneficiaryAddress;
        start = block.timestamp;
        duration = durationSeconds;
    }

    function release(address token) public {
        uint256 releasable = vertedAmount(token, uint256(block.timestamp)) - erc20Released[token];
        erc20Released[token] += releasable;
        emit ERC20Released(token, releasable);
        IERC20(token).transfer(beneficiary, releasable);
    }

    function vertedAmount(address token, uint256 timestamp) public view returns (uint256) {
        // 总代币量
        uint256 totalAllocation = IERC20(token).balanceOf(address(this)) + erc20Released[token];
        if (timestamp < start) {
            return 0;
        } else if (timestamp > start + duration) {
            return totalAllocation;
        } else {
            return (totalAllocation * (timestamp - start)) / duration;
        }
    }
}
