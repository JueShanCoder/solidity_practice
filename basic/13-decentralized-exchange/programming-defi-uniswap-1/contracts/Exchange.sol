pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract Exchange is ERC20{
    address public tokenAddress;

    constructor(address _token) ERC20("uniswap-V1", "UNI-V1"){
        require(_token != address(0), "invalid token address");
        tokenAddress = _token;
    }

    event AddLiquidity(uint256, uint256, uint256);

    function addLiquidity(uint256 _tokenAmount) public payable returns (uint256){
        if (getReserve() == 0) {
            IERC20 token = IERC20(tokenAddress);
            token.transferFrom(msg.sender, address(this), _tokenAmount);

            uint256 liquidity = address(this).balance;
            _mint(msg.sender, liquidity);
            console.log(
                "liquidity is : %s", liquidity
            );
            return liquidity;
        } else {
            uint256 ethReserve = address(this).balance - msg.value;
            uint256 tokenReserve = getReserve();
            uint256 tokenAmount = (msg.value * tokenReserve) / ethReserve;
            console.log(
                "addLiquidity ethReserve is : %s, tokenReserve is: %s, tokenAmount is: %s",
                    ethReserve,
                    tokenReserve,
                    tokenAmount
            );

            require(_tokenAmount >= tokenAmount, "insufficient token amount");

            IERC20 token =  IERC20(tokenAddress);
            token.transferFrom(msg.sender, address(this), tokenAmount);

            uint256 liquidity = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, liquidity);
            console.log(
                "liquidity is : %s", liquidity
            );
            return liquidity;
        }
    }

    function removeLiquidity(uint256 _amount) public returns (uint256, uint256) {
        require(_amount > 0, "invalid amount");
        uint256 ethAmount = (address(this).balance * _amount) / totalSupply();
        uint256 tokenAmount = (getReserve() * _amount) / totalSupply();

        _burn(msg.sender, _amount);
        payable(msg.sender).transfer(ethAmount);
        IERC20(tokenAddress).transfer(msg.sender, tokenAmount);
        console.log(
            "removeLiquidity ethAmount is : %s, tokenAmount is: %s, totalSupply is: %s",
                ethAmount,
                tokenAmount,
                totalSupply()
        );
        return (ethAmount, tokenAmount);
    }

    function getReserve() public view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    function getPrice(uint256 inputReserve, uint256 outputReserve)
        public pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "invalid reserves");
        return  (inputReserve * 1000) / outputReserve;
    }

    // basic formula：(inputAmount * outputReserve) / (inputReserve + inputAmount)
    // (x + Delta x)(y - Delta y) = xy
    // Delta y = (y * Delta x) / (x + Delta x)
    function getAmount(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) private pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "invalid reserves");

        uint256 inputAmountWithFee = inputAmount * 99;
        uint numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 100) + inputAmountWithFee;
        return numerator / denominator;
    }

    function getTokenAmount(uint256 _ethSold) public view returns (uint256) {
        require(_ethSold > 0, "ethSold is too small");

        uint tokenReserve = getReserve();

        return getAmount(_ethSold, address(this).balance, tokenReserve);
    }

    function getEthAmount(uint256 _tokenSold) public view returns (uint256) {
        require(_tokenSold > 0, "tokenSold is too small");

        uint256 tokenReserve = getReserve();

        return getAmount(_tokenSold,tokenReserve, address(this).balance);
    }

    function ethToTokenSwap(uint256 _minTokens) public payable {
        uint tokenReserve = getReserve();
        uint tokenBought = getAmount(msg.value, address(this).balance - msg.value, tokenReserve);

        console.log("[ethToTokenSwap] tokenReserve %s, balance %s, tokenBought %s", tokenReserve, (address(this).balance - msg.value), tokenBought);
        require(tokenBought >= _minTokens, "insufficient output amount");

        IERC20(tokenAddress).transfer(msg.sender, tokenBought);
    }

    function tokenToEthSwap(uint256 _tokenSold, uint256 _minEth) public {
        uint256 tokenReserve = getReserve();
        uint256 ethBought = getAmount(
            _tokenSold,
            tokenReserve,
            address(this).balance
        );
        console.log("[tokenToEthSwap] tokenReserve %s, ethBought %s", tokenReserve, ethBought);
        require(ethBought >= _minEth, "insufficient output amount");
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), _tokenSold);
        payable(msg.sender).transfer(ethBought);
    }
}
