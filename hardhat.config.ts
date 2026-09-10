import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";


export default defineConfig({
	plugins: [hardhatEthers],

	solidity: {
    version: "0.8.34",
  },

	networks: {
		hardhatMainnet: {
			type: "edr-simulated",
			chainType: "l1",

			forking: {
				url: "https://ethereum-sepolia-rpc.publicnode.com",
			},
		},
	},
});
