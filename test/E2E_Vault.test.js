require("dotenv").config();
const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("Vault E2E: Testando o motor autônomo do Keeper em Rust", function () {
  let vault;
  let usdc;
  
  let keeper; 
  let user1;  

  // === ATENÇÃO: COLOQUE SEU NOVO ENDEREÇO AQUI SE NECESSÁRIO ===
  const VAULT_ADDRESS = process.env.VAULT_ADDRESS;
	if (!VAULT_ADDRESS){
		throw new Error("VAULT_ADDRESS não definido no .env");
	}
  
  const DEPOSIT_AMOUNT = ethers.parseUnits("50000", 6);

  before(async function () {
    const signers = await ethers.getSigners();
    keeper = signers[0];
    user1 = signers[1];

    vault = await ethers.getContractAt("TokenVault", VAULT_ADDRESS);
    const usdcAddress = await vault.asset();
    
    usdc = await ethers.getContractAt(
      [
        "function approve(address,uint256) returns (bool)", 
        "function balanceOf(address) view returns (uint256)", 
        "function transfer(address,uint256) returns (bool)"
      ], 
      usdcAddress
    );

    console.log(`\n    🔗 Conectado ao Vault em: ${VAULT_ADDRESS}`);
    console.log(`    👤 Usuário de teste: ${user1.address}\n`);

    // =========================================================
    // HACK DE REDE LOCAL (CORRIGIDO): A Whale Dinâmica
    // Descobre o endereço do aUSDC e "rouba" dele!
    // =========================================================
    try {
      const AAVE_POOL_ADDRESS = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";
      const poolContract = await ethers.getContractAt(
        ["function getReserveData(address) view returns (uint256,uint128,uint128,uint128,uint128,uint128,uint40,uint16,address,address,address,address,uint128,uint128,uint128)"],
        AAVE_POOL_ADDRESS
      );
      
      const reserveData = await poolContract.getReserveData(usdcAddress);
      const aUsdcWhale = reserveData[8]; // O índice 8 é o endereço do aToken na Aave

      await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [aUsdcWhale],
      });
      const whaleSigner = await ethers.getSigner(aUsdcWhale);
      
			await network.provider.send("hardhat_setBalance", [
        aUsdcWhale,
        "0xDE0B6B3A7640000", // 1 ETH em valor Hexadecimal (10^18 wei)
      ]);

      await usdc.connect(whaleSigner).transfer(user1.address, ethers.parseUnits("100000", 6));
      console.log("    💵 User1 financiado com 100000 USDC via aUSDC Whale!");
    } catch (e) {
      console.log("    ⚠️ Falha ao financiar via aUSDC Whale:", e.message);
    }
  });

  it("1. O usuário faz o depósito e engatilha o bot em Rust", async function () {
    const userBalanceBefore = await usdc.balanceOf(user1.address);
    expect(userBalanceBefore).to.be.gte(DEPOSIT_AMOUNT, "O User1 não tem USDC suficiente para o teste");

    console.log("    -> User1 aprovando USDC...");
    await usdc.connect(user1).approve(VAULT_ADDRESS, DEPOSIT_AMOUNT);

    console.log("    -> User1 depositando 50000 USDC...");
    const tx = await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
    await tx.wait();

    const vaultIdleAssets = await usdc.balanceOf(VAULT_ADDRESS);
    expect(vaultIdleAssets).to.equal(DEPOSIT_AMOUNT, "O dinheiro não entrou no cofre");
  });

  it("2. Esperando o Bot em Rust atuar autonomamente...", async function () {
    console.log("    ⏳ Aguardando o bot Rust processar a matemática e enviar o rebalance()...");
    
    let idleAssets = await usdc.balanceOf(VAULT_ADDRESS);
    let tentativas = 0;
    let botAgiu = false;

    while (tentativas < 12) {
      idleAssets = await usdc.balanceOf(VAULT_ADDRESS);
      
      if (idleAssets < DEPOSIT_AMOUNT) {
        botAgiu = true;
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      tentativas++;
    }

    // Correção da sintaxe do Chai
    expect(botAgiu, "O bot em Rust não enviou a transação de rebalanceamento a tempo.").to.equal(true);
    
    console.log(`    ✅ O Bot agiu! Saldo ocioso restante no cofre: ${ethers.formatUnits(idleAssets, 6)} USDC`);

    const totalAssets = await vault.totalAssets();
    const tolerancia = 5n; 
		expect(totalAssets).to.be.gte(DEPOSIT_AMOUNT - tolerancia, "O totalAssets caiu além do erro de arredondamento esperado");
	});

  it("3. O usuário realiza o saque com sucesso", async function () {
    const userShares = await vault.balanceOf(user1.address);
    console.log(`    -> User1 solicitando saque de ${ethers.formatUnits(userShares, 6)} cotas...`);

    const usdcBalanceBefore = await usdc.balanceOf(user1.address);

    const tx = await vault.connect(user1).withdraw(userShares, user1.address, user1.address);
    await tx.wait();

    const usdcBalanceAfter = await usdc.balanceOf(user1.address);
    const amountWithdrawn = usdcBalanceAfter - usdcBalanceBefore;

    console.log(`    ✅ Saque concluído: User1 recuperou ${ethers.formatUnits(amountWithdrawn, 6)} USDC`);
    
    expect(amountWithdrawn).to.be.gte(DEPOSIT_AMOUNT, "O usuário não conseguiu resgatar todo o capital");
  });
});
