pragma solidity ^0.8.0;

import "../contracts/SimpleToken.sol";
import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";

contract TestSimpleToken {
    function testInitialBalanceUsingDeployedContract() public {
        SimpleToken simpleToken = new SimpleToken("Hello", "Token", 1, 10000);
        uint256 expected = 100000;

        Assert.equal(
            simpleToken.balanceOf(address(this)),
            expected,
            "Owner should have 10000 initially"
        );
    }

    function testTransfer() public {
        SimpleToken simpleToken = new SimpleToken("Hello", "Token", 1, 10000);

        uint256 expected = 100;
        address target = 0x3AF4AcF289E1EB77e197d11Ae89a9A5d1F0Fe2A7;
        simpleToken.transfer(target, expected);

        Assert.equal(
            expected,
            simpleToken.balanceOf(target),
            "Owner should have 100 initially"
        );
    }
}
