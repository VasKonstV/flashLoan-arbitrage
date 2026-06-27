// АДРЕС ВАШЕГО РАЗВЕРНУТОГО КОНТРАКТА
const CONTRACT_ADDRESS = "0x5fc8d32690cc91d4c39d9d3abcbd16989f875707"; 

// МИНИМАЛЬНЫЙ ABI ДЛЯ СЛУШАНИЯ СОБЫТИЙ СМАРТ-КОНТРАКТА
const ABI = [
    "function fn_RequestFlashLoan(uint256 _amountWBTC) external",
    "event LogStep(string message, uint256 value)",
    "event LogAddressStep(string message, address value)",
    "event ArbitrageExecuted(uint256 profit, uint256 wbtcOutAfterSwaps)"
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function addLog(text, type) {
    const output = document.getElementById("terminalOutput");
    if (output.innerHTML.includes("Terminal idle")) output.innerHTML = "";
    
    const time = new Date().toLocaleTimeString();
    output.innerHTML += `<div class="log ${type}"><span class="time">[${time}]</span> > ${text}</div>`;
}

// Делаем функцию глобальной, чтобы инлайн-обработчик onclick в HTML мог её вызвать в ESM/модульной структуре
window.startFlashLoan = async function() {
    const runBtn = document.getElementById("runBtn");
    document.getElementById("revenueCard").style.display = "none";
    runBtn.disabled = true;
    
    addLog("Connecting to Hardhat Localhost Network (http://127.0.0.1:8545)...", "info");
    await sleep(600);

    try {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; 
        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

        addLog("Wallet approved. Executing attack via proxy contract...", "info");
        await sleep(600);

        const amount = 1000000000; // 10 WBTC
        const tx = await contract.fn_RequestFlashLoan(amount);
        addLog(`Transaction broadcasted. Hash: ${tx.hash.substring(0, 25)}...`, "info");
        
        const receipt = await tx.wait();
        addLog("Block confirmed! Analyzing receipts and events...", "success");

        for (const item of receipt.logs) {
            try {
                const parsed = contract.interface.parseLog(item);
                
                if (parsed.name === "LogStep") {
                    await sleep(700);
                    let val = parsed.args;
                    let displayVal = val > 10000000 ? ethers.formatUnits(val, 8) + " WBTC" : val.toString();
                    addLog(`${parsed.args} ${displayVal}`, "success");
                }

                if (parsed.name === "LogAddressStep") {
                    await sleep(500);
                    addLog(`${parsed.args} ${parsed.args}`, "warning");
                }

                if (parsed.name === "ArbitrageExecuted") {
                    await sleep(1000);
                    const profitWBTC = parseFloat(ethers.formatUnits(parsed.args, 8));
                    const usdtProfit = profitWBTC * 60000; 
                    
                    addLog(`⚡ SUCCESS: Arbitrage complete. Net Profit: ${profitWBTC} WBTC`, "profit-log");
                    
                    document.getElementById("revenueValue").innerText = `+$${usdtProfit.toLocaleString(undefined, {minimumFractionDigits: 2})} USDT`;
                    document.getElementById("revenueCard").style.display = "block";
                }
            } catch (e) {
                // Игнорируем чужие логи ERC20
            }
        }

    } catch (error) {
        addLog(`Execution reverted: ${error.message}`, "error");
    } finally {
        runBtn.disabled = false;
    }
}
