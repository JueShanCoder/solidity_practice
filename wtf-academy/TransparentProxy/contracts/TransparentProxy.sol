pragma solidity ^0.8.0;

contract TransparentProxy {
    // 逻辑合约地址
    address public implementation;
    address public admin;
    string  public words;

    constructor(address _implementation) {
        admin = msg.sender;
        implementation = _implementation;
    }

    fallback() external payable {
        require(msg.sender != admin);
        (bool success, bytes memory data) = implementation.delegatecall(msg.data);
    }

    function upgrade(address newImplementation) external {
        if (msg.sender != admin) revert();
        implementation = newImplementation;
    }
}

contract LogicOld {
    address public implementation;
    address public admin;
    string  public words;

    function foo() public {
        words = "old";
    }
}

contract LogicNew {
    address public implementation;
    address public admin;
    string  public words;

    function foo() public {
        words = "new";
    }
}
