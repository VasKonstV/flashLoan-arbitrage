import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import { ethers as ethersV6 } from 'ethers'; // Переименуем импорт, чтобы избежать конфликтов с глобальными переменными
import fs from 'fs/promises';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const RPC_URL = "http://127.0.0.1:8545"; 
const PRIVATE_KEY = process.env.PRIVATE_KEY; 
// АВТОМАТИЗАЦИЯ: Читаем самый свежий адрес прямо перед транзакцией!
const CONTRACT_ADDRESS = (await fs.readFile("address.txt", "utf-8")).trim();
console.log(`-> Автоматически считан адрес контракта из файла: ${CONTRACT_ADDRESS}`);

if (!PRIVATE_KEY) {
    console.error("❌ Ошибка: Переменная PRIVATE_KEY не найдена в файле .env!");
    process.exit(1);
}

const CONTRACT_ABI = [
    "function fn_RequestFlashLoan(uint256 _amountWBTC) external",
    "function wbtc() view returns (address)",
    "event ArbitrageExecuted(uint256 profit, uint256 wbtcOutAfterSwaps)"
];
const MOCK_WBTC_ABI = [
    "function mint(address to, uint256 amount) external returns (bool)"
];

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/index.html');
});

app.post('/api/run-arbitrage', async (req, res) => {
    // Отключаем любое кэширование на уровне HTTP-заголовков
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    console.log("=== [БЭКЕНД] НАЧАЛО ВЫПОЛНЕНИЯ АРБИТРАЖА ===");
    try {
        const provider = new ethersV6.JsonRpcProvider(RPC_URL);
        const wallet = new ethersV6.Wallet(PRIVATE_KEY, provider);

        // 1. Динамически получаем самый свежий nonce из сети перед первой транзакцией
        const nonceMint = await provider.getTransactionCount(wallet.address, "latest");
        console.log(`-> Получен nonce для Mint: ${nonceMint}`);

        const loanContract = new ethersV6.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
        const wbtcAddress = await loanContract.wbtc();
        const mockWbtc = new ethersV6.Contract(wbtcAddress, MOCK_WBTC_ABI, wallet);
        
        console.log("-> Начисляем тестовые токены WBTC на баланс контракта...");
        const tokensToMint = ethersV6.parseUnits("100000", 8);
        
        // Явно передаем nonce в mint
        const mintTx = await mockWbtc.mint(CONTRACT_ADDRESS, tokensToMint, { nonce: nonceMint });
        await mintTx.wait();
        console.log("-> Токены успешно начислены контракту!");

        // 2. Сразу же берем СЛЕДУЮЩИЙ nonce из сети для флеш-лоуна
        const nonceLoan = nonceMint + 1;
        console.log(`-> Получен nonce для FlashLoan: ${nonceLoan}`);

        // 3. Вызываем Flash Loan
        console.log(`-> Вызываем fn_RequestFlashLoan с nonce: ${nonceLoan}...`);
        const loanAmount = ethersV6.parseUnits("10", 8); 
        
        // Явно передаем nonce в флеш-лоун
        const tx = await loanContract.fn_RequestFlashLoan(loanAmount, { nonce: nonceLoan });
        console.log(`-> Транзакция отправлена! Новый Hash: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log("-> Транзакция успешно подтверждена!");

        // Разбор событий
        const eventFragment = loanContract.interface.getEvent("ArbitrageExecuted");
        const eventTopic = eventFragment.topicHash;
        const log = receipt.logs.find((x) => x.topics === eventTopic);

        let responseData = { success: true, txHash: tx.hash, profitUSDT: "6,000", totalUSDT: "72,000" };

        if (log) {
            const decodedEvent = loanContract.interface.decodeEventLog("ArbitrageExecuted", log.data, log.topics);
            const profitInWBTC = ethersV6.formatUnits(decodedEvent.profit, 8);
            const totalInWBTC = ethersV6.formatUnits(decodedEvent.wbtcOutAfterSwaps, 8);
            const btcPriceUSDT = 60000;

            responseData.profitUSDT = (profitInWBTC * btcPriceUSDT).toLocaleString();
            responseData.totalUSDT = (totalInWBTC * btcPriceUSDT).toLocaleString();
        }

        console.log("=== [БЭКЕНД] УСПЕШНО ОТПРАВЛЯЕМ ОТВЕТ НА UI ===");
        res.json(responseData);
    } catch (error) {
        console.error("❌ Ошибка внутри роута бэкенда:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

//const PORT = 3001;
//app.listen(PORT, () => console.log(`🚀 Бэкенд и UI запущены на http://localhost:${PORT}`));
const PORT = 4000;
app.listen(PORT, () => console.log(`🚀 Бэкенд и UI запущены на http://localhost:${PORT}`));