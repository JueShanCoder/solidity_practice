pragma solidity ^0.8.0;

/**
 * 1.从投资俱乐部成员（以太）获得资金
 * 2.跟踪成员的贡献
 * 3.允许会员转移股份
 * 4.允许创建和投票投票
 * 5.批准成功的投资建议（即汇款）
 */
contract MemberVote {
    struct Proposal {
        uint id;
        string name;
        uint amount;
        address payable recipient;
        uint votes;
        uint end;
        bool approved;
    }

    mapping(address => bool) public members;
    mapping(address => uint) public shares;
    mapping(address => mapping(uint => bool)) public votes;
    mapping(uint => Proposal) public Proposals;

    // 总计
    uint public totalShares;
    // 可用资金
    uint public availableFunds;
    // 贡献截止时间
    uint public contributionEnd;
    // 下一次提议的 ID 号
    uint public nextProposalId;
    // 投票
    uint public voteTime;
    // 成员人数
    uint public quorum;
    address public owner;

    constructor(uint contributionTime, uint _voteTime, uint _quorum) public {
        require(_quorum > 1, 'quorum must be more than 1 member');
        contributionEnd = block.timestamp + contributionTime;
        voteTime = _voteTime;
        quorum = _quorum;
        owner = msg.sender;
    }

    function contribute() payable external {
        require(block.timestamp < contributionEnd, 'cannot contribute after contributionEnd');
        members[msg.sender] = true;
        shares[msg.sender] += msg.value;
        totalShares += msg.value;
        availableFunds += msg.value;
    }

    function redeemShare(uint amount) external {
        require(shares[msg.sender] >= amount, 'not enough shares');
        require(availableFunds >= amount, 'not enough available funds');
        shares[msg.sender] -= amount;
        availableFunds -= amount;
        msg.sender.transfer(amount);
    }



}
