import { network } from "hardhat";

const { ethers } = await network.create();


const Dilmas = await ethers.getContractFactory("Dilmas");


const token = await Dilmas.deploy();


await token.waitForDeployment();

console.log("Dilmas:", await token.getAddress());

const TokenVault = await ethers.getContractFactory("TokenVault");
const vault = await TokenVault.deploy(token.getAddress(), "Vault", "VAULT");
await vault.waitForDeployment();
console.log("TokenVault:", await vault.getAddress());
