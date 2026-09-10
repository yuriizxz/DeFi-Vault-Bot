import { network } from "hardhat";
import { AaveV3Sepolia } from "@aave-dao/aave-address-book"

const poolAddressesProvider = AaveV3Sepolia.POOL;

const USDC = AaveV3Sepolia.ASSETS.USDC.UNDERLYING;

// const aUSDC = AaveV3SepoliaAssets.USDC_A_TOKEN;


const { ethers } = await network.create();


//const Dilmas = await ethers.getContractFactory("Dilmas");
//const token = await Dilmas.deploy();
//await token.waitForDeployment();
//console.log("Dilmas:", await token.getAddress());

const TokenVault = await ethers.getContractFactory("TokenVault");

const vault = await TokenVault.deploy(USDC, poolAddressesProvider);

await vault.waitForDeployment();

console.log("TokenVault:", await vault.getAddress());
