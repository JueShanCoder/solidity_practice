pragma solidity ^0.8.0;

//私钥: 0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b
//公钥: 0xe16C1623c1AA7D919cd2241d8b36d9E79C1Be2A2
//消息: 0x0596569fca6f5680844578edef8bbeb7f964dfd680577843a7cf8977e7ad3478
//以太坊签名消息: 0x0d11a46fc47eb590f53c8145ae89753eaaaec9f222d20534325fe670a91a2cd1
//签名: 0x6a2e9ccbc687dcb16d89f769e378a2bc69cdf9c6be5f02b50d562553017f2e511c9c8d408a4541867ab964eff507aff106cb1460dd4642d0c8d55aa6d01eeb991c
contract ECDSA {

    // 消息 hash
    function getMessageHash(address account_, uint256 tokenId_) public pure returns(bytes32) {
        return keccak256(abi.encodePacked(account_, tokenId_));
    }

    // 以太坊签名消息
    function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32"), hash);
    }

    // @dev 从_msgHash和签名_signature中恢复signer地址
    function recoverSigner(bytes32 _msgHash, bytes memory _signature) internal pure returns (address){
        // 检查签名长度，65是标准r,s,v签名的长度
        require(_signature.length == 65, "invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        // 目前只能用assembly (内联汇编)来从签名中获得r,s,v的值
        assembly {
        /*
        前32 bytes存储签名的长度 (动态数组存储规则)
        add(sig, 32) = sig的指针 + 32
        等效为略过signature的前32 bytes
        mload(p) 载入从内存地址p起始的接下来32 bytes数据
        */
        // 读取长度数据后的32 bytes
            r := mload(add(_signature, 0x20))
        // 读取之后的32 bytes
            s := mload(add(_signature, 0x40))
        // 读取最后一个byte
            v := byte(0, mload(add(_signature, 0x60)))
        }
        // 使用ecrecover(全局函数)：利用 msgHash 和 r,s,v 恢复 signer 地址
        return ecrecover(_msgHash, v, r, s);
    }

    function verify(bytes32 _msgHash, bytes memory _signature, address _signer) internal pure returns (bool) {
        return recoverSigner(_msgHash, _signature) == _signer;
    }
}
