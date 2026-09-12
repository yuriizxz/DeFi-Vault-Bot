use std::time::Duration;

use alloy::{
 network::EthereumWallet, primitives::{Address, U256, address, utils::format_units}, providers::{Provider, ProviderBuilder}, signers::local::PrivateKeySigner, sol,
};

use eyre::Result;
use tokio::time::{Interval, interval};

sol!(
    #[sol(rpc)]
    TokenVault,
    "../artifacts/contracts/TokenVault.sol/TokenVault.json"
    );




sol! {
    #[sol(rpc)]
    interface IERC20 {
        function approve(address spender, uint256 amount) external returns (bool);
        function balanceOf(address account) external view returns (uint256);
        function transfer(address to, uint256 amount) external returns (bool);
        function transferFrom(address from, address to, uint256 amount) external returns (bool);
        function allowance(address owner, address spender) external view returns (uint256);
        function decimals() external view returns (uint8);
    }
}

sol! {
    #[sol(rpc)]
    interface  IPool
    {
        function getReserveData(address asset) external view returns (
            uint256 configuration,
            uint128 liquidityIndex,
            uint128 currentLiquidityRate,
            uint128 variableBorrowIndex,
            uint128 currentVariableBorrowRate,
            uint128 currentStableBorrowRate,
            uint40 lastUpdateTimestamp,
            uint16 id,
            address aTokenAddress,
            address stableDebtTokenAddress,
            address variableDebtTokenAddress,
            address interestRateStrategyAddress,
            uint128 accruedToTreasury,
            uint128 unbacked,
            uint128 isolationModeTotalDebt
        );
    }
}

sol! {
    #[sol(rpc)]
    interface IAaveOracle {
        function getAssetPrice(address) external view returns (uint256);
    }
}




#[tokio::main]
async fn main() -> Result<()> {
    let signer: PrivateKeySigner = std::env::var("PRIVATE_KEY")?.parse()?;

    let user: Address = signer.address();

    println!("User: {}", user);


    let wallet = EthereumWallet::from(signer);


    //instanciando o proveder para se conectar a uma rede Ethereum local
    let provider =
        ProviderBuilder::new()
            .wallet(wallet)
            .connect("http://127.0.0.1:8545/")
            .await?;
    
    //instanciando o endereço do contrato TokenVault
    let vault_address: Address = address!("0xB4B421f001218d13e2081868A908C33f5488FAF6");

    let vault = 
        TokenVault::new(
            vault_address,
            provider.clone()
            );
    //instancia a USDC para utlizar as funções declaradas na interface ABI  
        let usdc_address = vault.asset().call().await?;

        let usdc = IERC20::new(
            usdc_address,
            provider.clone()
            );
    //instacia pool para conseguir informações da aave
        let pool_address: Address = address!("0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951");
        let pool = IPool::new(
            pool_address,
            provider.clone()
            );

        let data = pool.getReserveData(usdc_address).call().await?;
    //instancia o Oracle para conseguir o preço ETH/USD da Sepolia
        let aave_oracle: Address = address!("0x2da88497588bf89281816106C7259e31AF45a663");
        let weth: Address = address!("C558DBdd856501FCd9aaF1E62eae57A9F0629a3c");             let usdc_oracle: Address = address!("0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8");
        let oracle = IAaveOracle::new(
            aave_oracle, provider.clone()
            );

        let price_weth = oracle.getAssetPrice(weth).call().await?;
        let price_usdc = oracle.getAssetPrice(usdc_oracle).call().await?;

   //     let convert_weth_usdc = price_weth/price_usdc;

    // Loop de 1/2 minuto==============================================================
    
        let mut ticker = interval(Duration::from_secs(30));

    loop {
        ticker.tick().await;

        println!("\n [Novo ciclo de análise do Vault]");

        let total_assets_result = vault.totalAssets().call().await;

        let total_assets = match total_assets_result {
            Ok(result) => result,
            Err(e) => {
                eprintln!("Erro ao ler saldo do cofre: {}", e);
                continue;
            }
        };

        println!("Saldo total atual: {}", total_assets);


        //Lógica matemática de rebalance. Só rebalanceia se tiver mais de 1000 tokens
        let min_limit = U256::from(1000u64) * U256::from(10u64).pow(U256::from(6u64));


        if total_assets >= min_limit {
 
            println!("Threshold atingido. Simulando custos de transação...");

        let investimento_usdc = total_assets.checked_mul(U256::from(70)).unwrap().checked_div(U256::from(100)).unwrap();

        let _liquidity_rate = data.currentLiquidityRate;
       
        let dias = U256::from(7);
        let ray = U256::from(10u64).pow(U256::from(27));

        let lucro_projetado_usdc = investimento_usdc.checked_mul(U256::from(data.currentLiquidityRate)).unwrap().checked_mul(dias).unwrap().checked_div(U256::from(365) * ray).unwrap();

        let gas_price = provider.get_gas_price().await?;
        let gas_limit = (vault.rebalance()).estimate_gas().await?;
        let gas_cost_wei = U256::from(gas_price).checked_mul(U256::from(gas_limit)).unwrap();       
       

        let gas_cost_usd_bruto = gas_cost_wei.checked_mul(price_weth).unwrap();

        let divisor_wei = U256::from(10u64).pow(U256::from(18));

        let gas_cost_usd = gas_cost_usd_bruto.checked_div(divisor_wei).unwrap();

        let precisao_oraculo = U256::from(10u64).pow(U256::from(8));
        let gas_cost_usdc = gas_cost_usd.checked_mul(precisao_oraculo).unwrap().checked_div(price_usdc).unwrap();

        let lucro_projetado_normalizado = lucro_projetado_usdc.checked_mul(U256::from(100)).unwrap();

        println!("\n--- 🐞 DEBUG DE DECIMAIS ---");
println!("1. Lucro Projetado Bruto (6 decimais): {}", lucro_projetado_usdc);
println!("2. Custo do Gás Bruto (8 decimais):  {}", gas_cost_usdc);

// O format_units coloca a vírgula no lugar certo para humanos lerem
println!("3. Lucro Real (Visão Humana): ${}", alloy::primitives::utils::format_units(lucro_projetado_usdc, 6).unwrap_or_default());
println!("4. Custo Real (Visão Humana): ${}", alloy::primitives::utils::format_units(gas_cost_usdc, 8).unwrap_or_default());
println!("----------------------------\n");
            if lucro_projetado_normalizado > gas_cost_usdc {

                match vault.rebalance().send().await {
                     Ok(pending_tx) => {
                        println!("Transação enviada. Hash:{:?}", pending_tx.tx_hash());
                         match pending_tx.get_receipt().await {
                             Ok(receipt) => {
                                 if receipt.status(){
                                     println!("Rebalancemento será realizado no bloco: {}", receipt.block_number.unwrap_or_default());
                                  } else {
                                     eprintln!("A transação reverteu no contrato");
                                    }  
                              },
                              Err(e) => eprintln!("Erro ao esperar recibo do bloco {}", e),
                         }
                 },
                      Err(e) => {eprintln!("Falha ao tentar enviar transação: {}", e);
                       }
                 }

             } else {
                 println!("O custo do gá corrói o rendimento. Rebalence não será realizado")
                }
        } else {
            println!{"Saldo abaixo do limite. Rebalance não será realizado."}
        }
    }
}
