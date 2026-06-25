// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "hardhat/console.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MyFinalLoan {
    address public owner;
    address public uniswapRouter;
    address public sushiRouter;
    address public wbtc;
    address public usdc;
    uint24 public constant UNISWAP_FEE = 3000;
    uint256 public minProfit;

    event ArbitrageExecuted(uint256 profit, uint256 wbtcOutAfterSwaps);

    constructor(
        address _uniswapRouter,
        address _sushiRouter,
        address _wbtc,
        address _usdc
    ) {
        owner = msg.sender;
        uniswapRouter = _uniswapRouter;
        sushiRouter = _sushiRouter;
        wbtc = _wbtc;
        usdc = _usdc;
        minProfit = 1e6;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function fn_RequestFlashLoan(uint256 _amountWBTC) external onlyOwner {
        console.log("fn_RequestFlashLoan called, amount:", _amountWBTC);
        uint256 fee = _amountWBTC * 5 / 10000;
        // �������� �������� ��� this
        _executeOperation(wbtc, _amountWBTC, fee);
    }

    function _executeOperation(
        address _token,
        uint256 _amount,
        uint256 _fee
    ) internal {
        console.log("_executeOperation called");
        console.log("_token:", _token);
        console.log("_amount:", _amount);
        console.log("_fee:", _fee);

        require(_token == wbtc, "Invalid token");

        uint256 usdcReceived = _swapWBTCtoUSDC(_amount);
        console.log("usdcReceived:", usdcReceived);
        require(usdcReceived > 0, "Swap WBTC->USDC failed");

        uint256 wbtcReceived = _swapUSDCtoWBTC(usdcReceived);
        console.log("wbtcReceived:", wbtcReceived);
        require(wbtcReceived > 0, "Swap USDC->WBTC failed");

        uint256 totalDebt = _amount + _fee;
        console.log("totalDebt:", totalDebt);
        require(wbtcReceived > totalDebt, "No profit");

        uint256 profit = wbtcReceived - totalDebt;
        console.log("profit:", profit);
        require(profit >= minProfit, "Profit below minimum");

        IERC20(wbtc).transfer(owner, profit);

        emit ArbitrageExecuted(profit, wbtcReceived);
        console.log("Event emitted");
    }

    function _swapWBTCtoUSDC(uint256 _amountIn) internal pure returns (uint256) {
        return _amountIn * 100;
    }

    function _swapUSDCtoWBTC(uint256 _amountIn) internal pure returns (uint256) {
        return _amountIn * 120 / 100;
    }

    function withdrawProfit(address _token) external onlyOwner {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        require(balance > 0, "No funds");
        IERC20(_token).transfer(owner, balance);
    }

    function setMinProfit(uint256 _newMinProfit) external onlyOwner {
        require(_newMinProfit > 0, "Invalid min profit");
        minProfit = _newMinProfit;
    }
}