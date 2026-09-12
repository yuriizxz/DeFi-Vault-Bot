import { ethers } from "hardhat";
import { AaveV3Sepolia } from "@aave-dao/aave-address-book";

async function main() {
    const pool = AaveV3Sepolia.POOL;
    const USDC = AaveV3Sepolia.ASSETS.USDC.UNDERLYING;

    console.log("Chain ID:", await ethers.provider.send("eth_chainId", []));
    console.log("Pool:", pool);
    console.log("USDC:", USDC);

    const TokenVault = await ethers.getContractFactory("TokenVault");
    
    // Implantação do contrato passando os endereços da Aave
    const vault = await TokenVault.deploy(USDC, pool);
    await vault.waitForDeployment();

    console.log("TokenVault:", await vault.getAddress());
}

// Tratamento de erros e execução do script
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
