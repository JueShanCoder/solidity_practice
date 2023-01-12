// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";


contract NFTSwap is IERC721Receiver {
    event List(address indexed seller, address indexed nftAddr, uint256 indexed tokenId, uint256 price);
    event Purchase(address indexed buyer, address indexed nftAddr, uint256 indexed tokenId, uint256 price);
    event Revoke(address indexed seller, address indexed nftAddr, uint256 indexed tokenId);
    event Update(address indexed seller, address indexed nftAddr, uint256 indexed tokenId, uint256 newPrice);

    struct Order {
        address owner;
        uint256 price;
    }

    mapping(address => mapping(uint256 => Order)) public nftList;

    fallback() external payable{}

    function onERC721Received(
        address operator,
        address from,
        uint tokenId,
        bytes calldata data
    ) external override returns (bytes4){
        return IERC721Receiver.onERC721Received.selector;
    }

    // 卖家创建 NFT 创建订单，并释放 List 事件。参数为 NFT 合约地址 _nftAddr，NFT 对应的 _tokenId, 挂单价格 _price(单位是 wei)。
    // 成功后，NFT 会从卖家转入 NFTSwap 合约中。
    function list(address _nftAddr, uint256 _tokenId, uint256 _price) public {
        IERC721 _nft = IERC721(_nftAddr);
        // 检测合约是否得到授权
        require(_nft.getApproved(_tokenId) == address(this), "Need Approval");
        require(_price > 0);
        Order storage _order = nftList[_nftAddr][_tokenId];
        _order.owner = msg.sender;
        _order.price = _price;
        // 将 NFT 转账到合约
        _nft.safeTransferFrom(msg.sender, address(this), _tokenId);

        // 释放 List 事件
        emit List(msg.sender, _nftAddr, _tokenId, _price);
    }

    // 撤单 revoke
    function revoke(address _nftAddr, uint256 _tokenId) public {
        Order storage _order = nftList[_nftAddr][_tokenId];
        require(_order.owner == msg.sender, "Not OWner");
        IERC721 _nft = IERC721(_nftAddr);
        require(_nft.ownerOf(_tokenId) == address(this), "Invalid Order");

        _nft.safeTransferFrom(address(this), msg.sender, _tokenId);
        delete nftList[_nftAddr][_tokenId];

        emit Revoke(msg.sender, _nftAddr, _tokenId);
    }
    
    // 调整价格：卖家调整挂单价格
    function update(address _nftAddr, uint256 _tokenId, uint256 _newPrice) public {
        require(_newPrice > 0, "Invalid Price");
        Order storage _order = nftList[_nftAddr][_tokenId];
        require(_order.owner == msg.sender, "Not Owner");
        IERC721 _nft = IERC721(_nftAddr);
        require(_nft.ownerOf(_tokenId) == address(this), "Invalid Order");

        _order.price = _newPrice;
        
        emit Update(msg.sender, _nftAddr, _tokenId, _newPrice);
    }

    // 购买： 买家购买 NFT，合约为 _nftAddr, tokenId 为 _tokenId ，调用函数要
    function purchase(address _nftAddr, uint256 _tokenId) payable public {
        Order storage _order = nftList[_nftAddr][_tokenId];
        require(_order.price > 0, "Invalid Price");
        require(msg.value >= _order.price, "Increase price");
        IERC721 _nft = IERC721(_nftAddr);
        require(_nft.ownerOf(_tokenId) == address(this), "Invalid Order");

        // 将 NFT 转给买家
        _nft.safeTransferFrom(address(this), msg.sender, _tokenId);
        // 将 ETH 转给卖家，多余 ETH 给买家退款
        payable(_order.owner).transfer(_order.price);
        payable(msg.sender).transfer(msg.value - _order.price);

        delete nftList[_nftAddr][_tokenId];

        // 释放 Purchase 事件
        emit Purchase(msg.sender, _nftAddr, _tokenId, msg.value);
        
    }

}
