require("@nomicfoundation/hardhat-toolbox");

require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
		version:"0.8.24", // Mantenha a mesma versão do seu contrato
		settings: {
			evmVersion: "cancun",
		},
	},

  networks: {
    hardhat: {
      forking: {
        url: process.env.SEPOLIA_RPC_URL,
			blockNumber: 5500000
			}
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
	mocha: {
		timeout: 100000
	}
};
