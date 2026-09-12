import { network } from "hardhat";
import { AaveV3Sepolia } from "@aave-dao/aave-address-book"

const pool = AaveV3Sepolia.POOL;

const USDC = AaveV3Sepolia.ASSETS.USDC.UNDERLYING;

// const aUSDC = AaveV3SepoliaAssets.USDC_A_TOKEN;


const { ethers } = await network.create();


//const Dilmas = await ethers.getContractFactory("Dilmas");
//const token = await Dilmas.deploy();
//await token.waitForDeployment();
//console.log("Dilmas:", await token.getAddress());


console.log(
	"Chain ID:",
	await ethers.provider.send("eth_chainId", [])
);
console.log("Pool:", AaveV3Sepolia.POOL);
console.log("USDC:", AaveV3Sepolia.ASSETS.USDC.UNDERLYING);

const TokenVault = await ethers.getContractFactory("TokenVault");
const vault = await TokenVault.deploy(USDC, pool);

await vault.waitForDeployment();

console.log("TokenVault:", await vault.getAddress());
