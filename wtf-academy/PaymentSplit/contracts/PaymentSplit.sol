// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaymentSplit {
    // 增加受益人事件
    event PayeeAdded(address account, uint256 shares);
    // 受益人提款事件
    event PaymentReleased(address to, uint256 amount);
    // 合约收款事件
    event PaymentReceived(address from, uint256 amount);

    // 总份额
    uint256 public totalShares;
    // 总支付
    uint256 public totalReleased;

    // 每个受益人的份额
    mapping(address => uint256) public shares;
    // 支付给每个受益人的份额
    mapping(address => uint256) public released;
    // 受益人数组
    address[] public payees;

    constructor(address[] memory _payees, uint256[] memory _shares) payable {
        // 受益人和受益份额需要一一匹配
        require(_payees.length == _shares.length, "PaymentSplitter: payees and shares length mismatch");
        require(_payees.length > 0, "PaymentSplitter: no payees");
        for (uint256 i = 0; i < _payees.length; i ++) {
            _addPayee(_payees[i], _shares[i]);
        }
    }

    receive() external payable virtual {
        emit PaymentReceived(msg.sender, msg.value);
    }

    function release(address payable _account) public virtual {
        require(shares[_account] > 0, "PaymentSplitter: account has no shares");
        // 计算应得的 ETH
        uint256 payment = releasable(_account);
        require(payment != 0, "PaymentSplitter: account is not due payment");
        totalReleased += payment;
        released[_account] += payment;
        _account.transfer(payment);

        emit PaymentReleased(_account, payment);
    }

    function releasable(address _account) public view returns (uint256) {
        uint256 totalReceived = address(this).balance + totalReleased;
        return pendingPayment(_account, totalReceived, released[_account]);
    }

    function pendingPayment(address _account, uint256 _totalReceived, uint256 _alreadyReleased)
    public view returns (uint256) {
        return (_totalReceived * shares[_account]) / totalShares - _alreadyReleased;
    }

    function _addPayee(address _account, uint256 _accountShare) private {
        require(_account != address(0), "PaymentSplitter: account is the zero address");
        require(_accountShare > 0, "PaymentSplitter: shares are 0");
        require(shares[_account] == 0, "PaymentSplitter: account already has shares");
        payees.push(_account);
        shares[_account] = _accountShare;
        totalShares += _accountShare;
        emit PayeeAdded(_account, _accountShare);
    }
}
