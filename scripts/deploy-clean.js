import hre from "hardhat";
import fs from "fs/promises";

async function main() {
    const { ethers } = await hre.network.create();

    console.log("1. Разворачиваем Mock-токен WBTC...");
    const MockWBTC = await ethers.getContractFactory("MockWBTC");
    const mockWbtc = await MockWBTC.deploy();
    await mockWbtc.waitForDeployment();
    const mockWbtcAddress = mockWbtc.target;
    console.log(`MockWBTC развернут по адресу: ${mockWbtcAddress}`);

    // Фейковые адреса-заглушки для остальных параметров конструктора
    const fakeRouterUniswap = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    const fakeRouterSushi = "0xd9e1c1535b7824f337411e226441526c1c1b3242";
    const fakeUsdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

    console.log("\n2. Разворачиваем основной контракт MyFinalLoan...");
    const MyFinalLoan = await ethers.getContractFactory("MyFinalLoan");
    
    // Передаем адрес нашего созданного Mock-токена в конструктор!
    const loanContract = await MyFinalLoan.deploy(
        fakeRouterUniswap,
        fakeRouterSushi,
        mockWbtcAddress,
        fakeUsdc
    );
    await loanContract.waitForDeployment();
    const loanAddress = loanContract.target;
    console.log(`MyFinalLoan развернут по адресу: ${loanAddress}`);

    // Сохраняем адрес основного контракта в файл
    await fs.writeFile("address.txt", loanAddress);
    console.log("Адрес успешно записан в address.txt");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
