// Функция для создания реалистичных пауз между шагами
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Имя функции строго совпадает с вашим index.html
async function startArbitrage() {
    const btn = document.getElementById('runBtn');
    const status = document.getElementById('status');
    const terminalBox = document.getElementById('terminalBox');
    const logConsole = document.getElementById('logConsole');
    const resultBox = document.getElementById('resultBox');

    // Сброс и подготовка UI перед запуском
    btn.disabled = true;
    resultBox.style.display = 'none';
    logConsole.innerHTML = ''; 
    terminalBox.style.display = 'block';
    status.innerText = 'Поиск оптимального маршрута...';

    // Функция для красивой печати строк в наш терминал логов
    function printLog(text, type = '') {
        const p = document.createElement('p');
        p.className = `log-line ${type}`;
        p.innerText = text;
        logConsole.appendChild(p);
        logConsole.scrollTop = logConsole.scrollHeight; // Автопрокрутка вниз
    }

    // --- ИМИТАЦИЯ ПОШАГОВОГО ПРОЦЕССА ДО ЗАПРОСА НА БЭКЕНД ---
    printLog("> Connecting to Hardhat Localhost Network (http://127.0.0.1:8545)...", "log-info");
    await sleep(700);
    
    printLog("> Connection established. Wallet: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    await sleep(500);

    printLog("> Scanning DEX Liquidity pools (Uniswap V3, Sushiswap)...", "log-warn");
    await sleep(900);

    printLog("> Optimal path found: WBTC -> USDC (Uniswap) -> WBTC (Sushiswap)", "log-success");
    await sleep(600);

    printLog("> Requesting transaction signature from Backend...", "log-info");
    await sleep(400);

    try {
        // Отправляем реальный запрос на бэкенд (порт 4000)
        const response = await fetch('http://localhost:4000/api/run-arbitrage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();

        if (data.success) {
            // --- ПОШАГОВЫЙ ВЫВОД ПОСЛЕ ПОЛУЧЕНИЯ ОТВЕТА ОТ СЕТИ ---
            printLog(`> Broadcasted transaction to network!`, "log-info");
            await sleep(500);

            printLog(`> [STEP 1] MockWBTC.mint() -> Minted 100,000 WBTC to Contract`, "log-success");
            await sleep(600);

            printLog(`> [STEP 2] fn_RequestFlashLoan() initiated. Loan amount: 10 WBTC`, "log-info");
            await sleep(700);

            printLog(`> [STEP 3] EVM Internal Execution: executed swap WBTC -> USDC`, "log-success");
            await sleep(500);

            printLog(`> [STEP 4] EVM Internal Execution: executed swap USDC -> WBTC`, "log-success");
            await sleep(400);

            printLog(`> [STEP 5] Flash loan repaid. Profit calculated successfully!`, "log-success");
            await sleep(600);

            printLog(`> Block minted successfully! Hash: ${data.txHash}`, "log-info");
            await sleep(300);

            // Выводим финальные результаты в основное окно
            status.innerText = '🚀 Транзакция успешно выполнена через бэкенд!';
            document.getElementById('profitRes').innerText = data.profitUSDT;
            document.getElementById('totalRes').innerText = data.totalUSDT;
            document.getElementById('hashRes').innerText = data.txHash;
            resultBox.style.display = 'block';
        } else {
            printLog(`❌ Execution reverted: ${data.error}`, "log-error");
            status.innerText = '❌ Ошибка на бэкенде';
        }
    } catch (err) {
        printLog(`❌ Network Error: Unable to connect to backend server.`, "log-error");
        status.innerText = '❌ Ошибка связи с сервером';
        console.error(err);
    } finally {
        btn.disabled = false;
    }
}
