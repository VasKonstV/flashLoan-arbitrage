import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "dotenv/config";

export default defineConfig({
  // Обязательно регистрируем новый плагин в массиве
  plugins: [hardhatToolboxMochaEthers],
  
  solidity: "0.8.20",
  
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
});
/*require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
};*/