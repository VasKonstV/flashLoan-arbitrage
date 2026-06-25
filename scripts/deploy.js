const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 ДЕПЛОЙ ЧЕРЕЗ hre.artifacts + ethers");

  // Получаем артефакт через Hardhat
  const artifact = await hre.artifacts.readArtifact("Minimal");
  console.log("Имя контракта из артефакта:", artifact.contractName);

  // Получаем подписанта (signer)
  const [deployer] = await hre.ethers.getSigners();
  console.log("Деплой с аккаунта:", deployer.address);

  // Создаём фабрику через чистый ethers (но с signer от Hardhat)
  const { ethers } = require("ethers");
  const ContractFactory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployer);
  console.log("Имя контракта:", ContractFactory.contractName)
  console.log("Развертываем...");
  const contract = await ContractFactory.deploy();
  console.log("Ожидаем завершения...");
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("========================================");
  console.log("🔥 НОВЫЙ АДРЕС КОНТРАКТА:", address);
  console.log("========================================");
  
  fs.writeFileSync("address.txt", address);
  console.log("✅ Адрес сохранён в address.txt");
}

main().catch(console.error);