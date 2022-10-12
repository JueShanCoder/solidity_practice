// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

// storage  全局变量，写到存储中 
// memory   局部变量，只在内存中生效
// calldata 只在参数中使用，可以节约 gas，直接进行值传递
contract DataLocations {
    struct MyStruct {
        uint foo;
        string text;
    }

    mapping(address => MyStruct) public myStructs;

    // storage
    function example() external {
        myStructs[msg.sender] = MyStruct({foo:123, text: "bar"});

        MyStruct storage myStruct = myStructs[msg.sender];
        myStruct.text = "foo";

        MyStruct memory readOnly = myStructs[msg.sender];
        readOnly.foo = 456;
    }

    // memory 
    function exampleMemory(uint[] memory y, string memory s) external returns (uint[] memory) {
        uint[] memory memArr = new uint[](3);
        memArr[0] = 234;
        return memArr;
    }

    // calldata
    function exampleCalldata(uint[] calldata y, string calldata s) external returns (uint[] memory) {
        _internal(y);

        uint[] memory memArr = new uint[](3);
        memArr[0] = 234;
        return memArr;
    }

    // internal
    function _internal(uint[] calldata y) private {
        uint x = y[0];
    }
}