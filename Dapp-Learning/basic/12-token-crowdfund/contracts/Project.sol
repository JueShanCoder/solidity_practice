pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Project {
    using SafeMath for uint256;

    enum State {
        Fundraising,
        Expired,
        Successful
    }

    // 众筹合约的发起者
    address payable public creator;
    // 众筹预计金额，必须达到此金额，否则原路退回
    uint public amountGoal;
    // 众筹完成时间
    uint public completeAt;
    // 已筹金额
    uint256 public currentBalance;
    // 众筹的截止日期
    uint public raiseBy;
    // 众筹合约的标题
    string public title;
    // 众筹合约的描述
    string public description;
    // 初始化状态为待众筹
    State public state = State.Fundraising;
    // 参与志愿者
    mapping (address => uint) public contributions;

    // 收到资金触发的事件
    event FundingReceived(address contributor, uint amount, uint currentTotal);
    //
    event CreatorPaid(address recipient);

    modifier inState(State _state) {
        require(state == _state);
        _;
    }

    modifier isCreator() {
        require(msg.sender == creator);
        _;
    }

    constructor
    (
        address payable projectStarter,
        string memory projectTitle,
        string memory projectDesc,
        uint fundRaisingDeadline,
        uint goalAmount
    ) {
        creator = projectStarter;
        title = projectTitle;
        description = projectDesc;
        raiseBy = fundRaisingDeadline;
        amountGoal = goalAmount;
        currentBalance = 0;
    }

    function contribute() external inState(State.Fundraising) payable {
        require(msg.sender != creator);
        contributions[msg.sender] = contributions[msg.sender].add(msg.value);
        currentBalance= currentBalance.add(msg.value);
        emit FundingReceived(msg.sender, msg.value, currentBalance);
        checkIfFundingCompleteOrExpired();
    }

    function checkIfFundingCompleteOrExpired() public {
        if (currentBalance >= amountGoal) {
            state = State.Successful;
            payOut();
        } else if (block.timestamp > raiseBy) {
            state = State.Expired;
        }

        completeAt = block.timestamp;
    }

    function payOut() internal inState(State.Successful) returns (bool) {
        uint256 totalRaised = currentBalance;
        currentBalance = 0;

        if (creator.send(totalRaised)) {
            emit CreatorPaid(creator);
            return true;
        } else {
            currentBalance = totalRaised;
            state = State.Successful;
        }
        return false;
    }

    function getRefund() public inState(State.Expired) returns (bool) {
        require(contributions[msg.sender] > 0);

        uint amountToRefund = contributions[msg.sender];
        contributions[msg.sender] = 0;

        if (!payable(msg.sender).send(amountToRefund)) {
            contributions[msg.sender] = amountToRefund;
            return false;
        } else {
            currentBalance = currentBalance.sub(amountToRefund);
        }
        return true;
    }

    function getDetails() public view returns
    (
        address payable projectStarter,
        string memory projectTitle,
        string memory projectDesc,
        uint256 deadline,
        State currentState,
        uint256 currentAmount,
        uint256 goalAmount
    ){
        projectStarter = creator;
        projectTitle = title;
        projectDesc = description;
        deadline = raiseBy;
        currentState = state;
        currentAmount = currentBalance;
        goalAmount = amountGoal;
    }
}
