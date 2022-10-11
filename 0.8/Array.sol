// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

contract Array {
    uint[] public nums = [1,2,3];
    uint[5] public numsFixed = [4,5,6];

    function example() external {
        nums.push(4); // [1,2,3,4]
        uint x = nums[1];
        nums[2] = 777; // [1,2,777,4]
        delete nums[1]; // [1,0,777,4]        
        nums.pop(); // [1,0,777]
        uint len = nums.length;

        // create array in memory
        uint[] memory a = new uint[](5);
        a[1] = 123;
    }

    function returnArray() external view returns (uint[] memory) {
        return nums;
    }

}