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

    // 投资俱乐部成员池
    mapping(address => bool) public members;
    // 资金明细池
    mapping(address => uint) public shares;
    // 投资投票池
    mapping(address => mapping(uint => bool)) public votes;
    // 投资池
    mapping(uint => Proposal) public proposals;

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
    // 批准同意人数
    uint public quorum;
    // 俱乐部发起者
    address public owner;

    modifier onlyMembers() {
        require(members[msg.sender] == true, "only members");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    constructor(uint contributionTime, uint _voteTime, uint _quorum) public {
        require(_quorum > 1, 'quorum must be more than 1 member');
        contributionEnd = block.timestamp + contributionTime;
        voteTime = _voteTime;
        quorum = _quorum;
        owner = msg.sender;
    }

    // 参与俱乐部
    function contribute() payable external {
        require(block.timestamp < contributionEnd, 'cannot contribute after contributionEnd');
        members[msg.sender] = true;
        shares[msg.sender] += msg.value;
        totalShares += msg.value;
        availableFunds += msg.value;
    }

    // 撤销参与
    function redeemShare(uint amount) external {
        require(shares[msg.sender] >= amount, 'not enough shares');
        require(availableFunds >= amount, 'not enough available funds');
        shares[msg.sender] -= amount;
        availableFunds -= amount;
        payable (msg.sender).transfer(amount);
    }

    // 转移
    function transferShare(uint amount, address payable to) external {
        require(shares[msg.sender] >= amount, "not enough shares");
        shares[msg.sender] -= amount;
        shares[to] += amount;
        members[to] = true;
    }

    // 申请投资提议
    function createProposal(string calldata name, uint amount, address payable recipient) external onlyMembers() {
        require(availableFunds >= amount, 'amount too big');
        proposals[nextProposalId] = Proposal(
        nextProposalId,
        name,
        amount,
        recipient,
        0,
        block.timestamp + voteTime,
        false
        );
        nextProposalId ++;
    }

    // 投票
    function vote(uint proposalId) external onlyMembers {
        Proposal storage proposal = proposals[proposalId];
        require(votes[msg.sender][proposalId] == false, 'members can only vote once for a proposal');
        require(block.timestamp < proposal.end, 'can only vote util proposal end date');
        votes[msg.sender][proposalId] = true;
        proposal.votes += shares[msg.sender];
    }

    // 批准投资
    function approveProposal(uint proposalId) external onlyOwner() {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.end, 'cannot approve proposal before end date');
        require(proposal.approved == false, 'current proposal already approved');
        // ???
        require(((proposal.votes * 100) / totalShares) >= quorum, 'cannot approve proposal with votes $ below quorum');
        proposal.approved = true;
        _transferEther(proposal.amount, proposal.recipient);
    }

    // 管理员提现
    function withdrawEther(uint amount, address payable to) external onlyOwner() {
        _transferEther(amount, to);
    }

    //
    function _transferEther(uint amount, address payable to) internal {
        require(amount <= availableFunds, 'not enough availableFund');
        availableFunds -= amount;
        to.transfer(amount);
    }

    function receive() payable external {
        availableFunds += msg.value;
    }
}
