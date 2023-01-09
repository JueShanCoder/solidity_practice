pragma solidity ^0.8.0;

import '@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol';
import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';

contract RandomNumberConsumer is VRFConsumerBaseV2 {

    event FulfillRandomness(uint256, uint256[]);
    event RequestId(address, uint256);

    VRFCoordinatorV2Interface COORDINATOR;
    LinkTokenInterface LINKTOKEN;

    // 消费合同注册的订阅 ID。Link 资产将从此订阅中扣除。
    uint64 s_subscriptionId;

    address vrfCoordinator = 0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D;

    address link = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;

    bytes32 keyHash = 0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15;

    // 用户愿意为完成回调 VRF 函数支付的最大 gas 量。
    uint32 callbackGasLimit = 100000;

    // Default = 3,
    uint16 requestConfirmations = 3;

    // 要请求的随机数。
    uint32 numWords = 2;

    uint256[] public s_randomWords;
    uint256 public s_requestId;
    address s_owner;

    constructor(uint64 subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        LINKTOKEN = LinkTokenInterface(link);
        s_owner = msg.sender;
        s_subscriptionId = subscriptionId;
    }

    function requestRandomWords() external onlyOwner {
        s_requestId = COORDINATOR.requestRandomWords(keyHash, s_subscriptionId, requestConfirmations, callbackGasLimit, numWords);
        emit RequestId(msg.sender, s_requestId);
    }

    function fulfillRandomWords(
        uint256,
        uint256[] memory randomWords
    ) internal override {
        s_randomWords = randomWords;
        emit FulfillRandomness(s_requestId, s_randomWords);
    }

    modifier onlyOwner() {
        require(msg.sender == s_owner);
        _;
    }
}
