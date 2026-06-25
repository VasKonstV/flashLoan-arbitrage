const hre = require("hardhat");
const fs = require("fs");

async function main() {
  // Используйте АКТУАЛЬНЫЙ адрес из deploy.js
  const contractAddress = fs.readFileSync("address.txt", "utf8").trim();
  console.log("Подключаемся к контракту по адресу:", contractAddress);

  const FlashLoan = await hre.ethers.getContractFactory("MyFinalLoan");
  const flashLoan = FlashLoan.attach(contractAddress);

  console.log("🔍 Проверяем owner...");
  const owner = await flashLoan.owner();
  console.log("Владелец:", owner);

  console.log("🔍 Проверяем minProfit...");
  const minProfit = await flashLoan.minProfit();
  console.log("minProfit:", minProfit.toString());

  console.log("🔍 Устанавливаем minProfit = 0");
  const setTx = await flashLoan.setMinProfit(0);
  await setTx.wait();
  console.log("✅ minProfit установлен");

  const amount = hre.ethers.parseUnits("0.01", 8);
  console.log("📤 Отправляем запрос флеш-кредита на", hre.ethers.formatUnits(amount, 8), "WBTC");

  console.log("🔍 Вызываем fn_RequestFlashLoan...");
  const tx = await flashLoan.fn_RequestFlashLoan(amount);
  console.log("📝 Транзакция отправлена, хэш:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Транзакция подтверждена в блоке:", receipt.blockNumber);

  // Проверяем логи контракта
  console.log("🔍 Сырые логи (receipt.logs):", receipt.logs);
  if (receipt.logs.length === 0) {
    console.log("❌ Логов нет — контракт не сгенерировал событие.");
    console.log("   Это значит, что _executeOperation не была вызвана или остановилась до emit.");
  }
}

main().catch(console.error);