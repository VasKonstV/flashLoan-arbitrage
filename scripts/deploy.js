//const hre = require("hardhat");
import hre from "hardhat";

async function main() {
   // 1. Создаем сетевое окружение и забираем ethers
   const { ethers } = await hre.network.create();

   // 2. Читаем артефакт контракта С ДИСКА через hre.artifacts
   const artifact = await hre.artifacts.readArtifact("Minimal");
   
   // 3. Получаем фабрику контракта
   const ContractFactory = await ethers.getContractFactory("Minimal");
   
   // 4. Записываем имя в объект фабрики вручную
   ContractFactory.contractName = artifact.contractName;
   console.log("Имя контракта из ContractFactory:", ContractFactory.contractName);

   // 5. Получаем подписанта и деплоим
   const [deployer] = await ethers.getSigners();
   console.log(`Деплой с аккаунта: ${deployer.address}`);

   console.log("Развертываем...");
   const contract = await ContractFactory.deploy();
   await contract.waitForDeployment();

   // В ethers v6 адрес извлекается через свойство .target
   const contractAddress = contract.target;
   console.log(`Контракт успешно развернут по адресу: ${contractAddress}`);
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
/*import hre from "hardhat";

async function main() {
    // Получаем имя из артефакта, так как в фабрике его нет
    const artifact = await hre.artifacts.readArtifact("Minimal");
    console.log("Имя контракта из артефакта:", artifact.contractName);

    const [deployer] = await hre.ethers.getSigners();
    // Выводим nonce, чтобы убедиться, меняется ли он
    const nonce = await hre.ethers.provider.getTransactionCount(deployer.address);
    console.log(`Деплой с аккаунта: ${deployer.address} (Текущий nonce: ${nonce})`);

    // Получаем фабрику через hre
    const ContractFactory = await hre.ethers.getContractFactory("Minimal");
    console.log("Развертываем...");

    const contract = await ContractFactory.deploy();
    await contract.waitForDeployment();

    // В ethers 6 адрес берется через getTarget()
    const contractAddress = await contract.getTarget();
    console.log(`Контракт успешно развернут по адресу: ${contractAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});*/
/*const hre = require("hardhat");
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
  const ContractFactory = new ethers.ContractFactory(artifact.abi, 
    artifact.bytecode, deployer);
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

main().catch(console.error);*/