pragma solidity ^0.8.0;

contract TimeLock {
    // 交易取消事件
    event CancelTransaction(bytes32 indexed txHash, address indexed target,
        uint value, string signature, bytes data, uint executeTime);
    // 交易执行事件
    event ExecuteTransaction(bytes32 indexed txHash, address indexed target,
        uint value, string signature, bytes data, uint executeTime);
    // 交易创建并进入队列事件
    event QueueTransaction(bytes32 indexed txHash, address indexed target, uint value, string signature, bytes data, uint executeTime);
    // 修改管理员地址事件
    event NewAdmin(address indexed newAdmin);

    // 管理员地址
    address public admin;
    // 交易有效期，过期的交易作废
    uint public constant GRACE_PERIOD = 7 days;
    // 交易锁定时间（秒）
    uint public delay;
    // txHash 到 bool，记录所有在时间锁队列中的交易
    mapping(bytes32 => bool) public queuedTransactions;

    modifier onlyOwner() {
        require(msg.sender == admin, "TimeLock: Caller not admin");
        _;
    }

    modifier onlyTimeLock() {
        require(msg.sender == address(this), "TimeLock: Caller not TimeLock");
        _;
    }

    constructor(uint delay_) {
        delay = delay_;
        admin = msg.sender;
    }

    function changeAdmin(address newAdmin) public onlyTimelock {
        admin = newAdmin;

        emit NewAdmin(newAdmin);
    }

    function queueTransaction(address target, uint256 value, string memory signature,
        bytes memory data, uint256 executeTime) public onlyOwner returns (bytes32) {
        require(executeTime >= getBlockTimestamp() + delay,
            "TimeLock:queueTransaction: Estimated execution block must satisfy delay");
        bytes32 txHash = getTxHash(target, value, signature, data, executeTime);
        queuedTransactions[txHash] = true;

        emit QueueTransaction(txHash, target, value, signature, data, executeTime);
        return txHash;
    }

    function cancelTransaction(address target, uint256 value, string memory signature,
        bytes memory data, uint256 executeTime) public onlyOwner {
        bytes32 txHash = getTxHash(target, value, signature, data, executeTime);
        require(queuedTransactions[txHash], "Timelock::cancelTransaction: Transaction hasn't been queued.");
        queuedTransactions[txHash] = false;

        emit CancelTransaction(txHash, target, value, signature, data, executeTime);
    }

    function executeTransaction(address target, uint256 value, string memory signature,
        bytes memory data, uint256 executeTime) public payable onlyOwner returns (bytes memory) {
        bytes32 txHash = getTxHash(target, value, signature, data, executeTime);
        require(queuedTransactions[txHash], "Timelock::executeTransaction: Transaction hasn't been queued.");
        require(getBlockTimestamp() >= executeTime, "Timelock::executeTransaction: Transaction hasn't surpassed time lock.");
        require(getBlockTimestamp() <= executeTime + GRACE_PERIOD, "Timelock::executeTransaction: Transaction is stale.");
        queuedTransactions[txHash] = false;

        bytes memory callData;
        if (bytes(signature).length == 0) {
            callData = data;
        } else {
            callData = abi.encodePacked(bytes4(keccak256(bytes(signature))), data);
        }
        (bool success, bytes memory returnData) = target.call{value: value}(callData);
        require(success, "Timelock::executeTransaction: Transaction execution reverted.");

        return returnData;
    }

    function getBlockTimestamp() public view returns (uint) {
        return block.timestamp;
    }

    function getTxHash(
        address target,
        uint value,
        string memory signature,
        bytes memory data,
        uint executeTime
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(target, value, signature, data, executeTime));
    }
}
