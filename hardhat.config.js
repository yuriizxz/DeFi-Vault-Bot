require("@nomicfoundation/hardhat-toolbox");

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
        url:"https://sepolia.infura.io/v3/d22344b667934bfea9db8d5f6d3d6eaa",
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
