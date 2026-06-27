import hre from "hardhat";
import fs from "fs/promises";

async function main() {
    const { ethers } = await hre.network.create();

    // 1. Подключаемся к MyFinalLoan
    const contractAddress = (await fs.readFile("address.txt", "utf-8")).trim();
    const [owner] = await ethers.getSigners();
    const loanContract = await ethers.getContractAt("MyFinalLoan", contractAddress, owner);
    console.log(`Подключились к MyFinalLoan: ${contractAddress}`);

    // 2. Получаем адрес WBTC, который зашит в контракте
    const wbtcAddress = await loanContract.wbtc();

    // 3. Подключаемся к контракту MockWBTC по этому адресу
    const mockWbtc = await ethers.getContractAt("MockWBTC", wbtcAddress, owner);

    // 4. Начисляем прибыль на баланс контракта через легальный mint()
    console.log("Начисляем тестовые токены WBTC на баланс контракта...");
    const tokensToMint = ethers.parseUnits("100000", 8);
    const mintTx = await mockWbtc.mint(contractAddress, tokensToMint);
    await mintTx.wait();
    console.log("Токены успешно начислены контракту!");

    // 5. Вызываем Flash Loan
    console.log("\nВызываем fn_RequestFlashLoan...");
    const loanAmount = ethers.parseUnits("10", 8); 
    
    const tx = await loanContract.fn_RequestFlashLoan(loanAmount);
    console.log(`Транзакция отправлена: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log("Транзакция успешно подтверждена!");

    // 6. Перехват события
    const eventTopic = loanContract.interface.getEvent("ArbitrageExecuted").topicHash;
    const log = receipt.logs.find((x) => x.topics[0] === eventTopic); // В ethers v6 хэш события лежит в topics[0]

    if (log) {
        const decodedEvent = loanContract.interface.decodeEventLog(
            "ArbitrageExecuted",
            log.data,
            log.topics
        );

        console.log("\n=== СОБЫТИЕ СРАБОТАЛО! ===");
        // Переводим сатоши в полноценный WBTC (у WBTC 8 знаков после запятой)
        const profitInWBTC = ethers.formatUnits(decodedEvent.profit, 8);
        const totalInWBTC = ethers.formatUnits(decodedEvent.wbtcOutAfterSwaps, 8);

        console.log(`Прибыль (profit): ${profitInWBTC} WBTC`);
        console.log(`Всего на выходе:   ${totalInWBTC} WBTC`);

        // 2. Задаем текущий курс Биткоина к доллару (USDT)
        const btcPriceUSDT = 60000; // Можете указать любой актуальный курс

        // 3. Считаем эквивалент в долларах
        const profitInUSDT = profitInWBTC * btcPriceUSDT;
        const totalInUSDT = totalInWBTC * btcPriceUSDT;

        console.log(`Прибыль (profit): ${profitInUSDT.toLocaleString()} USDT)`);
        console.log(`Всего на выходе:  ${totalInUSDT.toLocaleString()} USDT)`);
    } else {
        console.log("Предупреждение: Событие ArbitrageExecuted не найдено.");
    }
}

main().catch((error) => {
    console.error("\nПроизошла ошибка при выполнении:", error);
    process.exitCode = 1;
});
