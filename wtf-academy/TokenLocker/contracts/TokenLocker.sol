pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenLocker {
    // 锁仓开始事件，记录受益人地址、代币地址、锁仓起始事件、结束事件
    event TokenLockStart(address indexed beneficiary, address indexed token, uint256 startTime, uint256 lockTime);
    // 代币释放事件
    event Release(address indexed beneficiary, address indexed token, uint256 releaseTime, uint256 amount);

    // 被锁仓的 ERC20 代币合约
    IERC20 public immutable token;
    // 受益人地址
    address public immutable beneficiary;
    // 锁仓时间（秒）
    uint256 public immutable lockTime;
    // 锁仓起始时间戳（秒）
    uint256 public immutable startTime;

    constructor(IERC20 _token, address _beneficiary, uint256 _lockTime) {
        require(lockTime > 0, "TokenLock: locakTime should be greater than 0");
        token = _token;
        beneficiary = _beneficiary;
        lockTime = _lockTime;
        startTime = block.timestamp;

        emit TokenLockStart(_beneficiary, address(_token) , block.timestamp, _lockTime);
    }

    function release() public {
        require(block.timestamp >= startTime + lockTime, "TokenLock: current time is before release time");
        uint256 amount = token.balanceOf(address(this));
        require(amount > 0, "TokenLock: no token to release");

        token.transfer(beneficiary, amount);
        emit Release(beneficiary, address(token), block.timestamp, amount);
    }

}
