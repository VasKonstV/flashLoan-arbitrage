// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockWBTC is ERC20 {
    constructor() ERC20("Mock WBTC", "mWBTC") {}

    // Функция, которая позволяет любому бесплатно напечатать себе токены для тестов
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}