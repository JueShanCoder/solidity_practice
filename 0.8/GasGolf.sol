// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract GasGolf {
    // start - 58489 gas
    // calldata - 49115 gas
    // local state variables to memory - 48904 gas
    // short circuit - 48586 gas
    // loop increments - 48214 gas
    // cache array length - 48179 gas
    // load array elements to memory - 48017 gas


    uint public total;

    // [1,2,3,4,5,100]
    function sumIfEvenAndLessThan99(uint[] calldata nums) external {
        uint _total = total;
        uint _size = nums.length;
        for (uint i = 0; i < _size; ++i) {
            uint _num = nums[i];
            if (_num % 2 == 0 && _num < 99) {
                _total += _num;
            }
        }
        total = _total;
    }
}