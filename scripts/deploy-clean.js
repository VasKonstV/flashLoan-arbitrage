const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Деплой с принудительной загрузкой");

  const uniswapRouter = "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD";
  const sushiRouter = "0xeaBcE3E74EF41FB40024a21Cc2ee2F5dDc615791";
  const wbtc = "0x29f2D40B0605204364af54EC677bD022dA425d03";
  const usdc = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";

  // ПРИНУДИТЕЛЬНАЯ ЗАГРУЗКА по имени файла
  const MyNewFlashLoan = await hre.ethers.getContractFactory("MyNewFlashLoan");
  const flashLoan = await MyNewFlashLoan.deploy(uniswapRouter, sushiRouter, wbtc, usdc);
  await flashLoan.waitForDeployment();
  const address = await flashLoan.getAddress();

  console.log("========================================");
  console.log("🔥 НОВЫЙ АДРЕС КОНТРАКТА:", address);
  console.log("========================================");

  fs.writeFileSync("address.txt", address);
  console.log("✅ Адрес сохранён в address.txt");
}

main().catch(console.error);