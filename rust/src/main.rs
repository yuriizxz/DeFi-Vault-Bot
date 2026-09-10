use alloy::{
 network::EthereumWallet, primitives::{Address, U256, address}, providers::ProviderBuilder, signers::local::PrivateKeySigner, sol,
};

use eyre::Result;

sol!(
    #[sol(rpc)]
    TokenVault,
    "../artifacts/contracts/TokenVault.sol/TokenVault.json"
    );

sol!(
    #[sol(rpc)]
    Dilmas,
    "../artifacts/contracts/Dilmas.sol/Dilmas.json"
);


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
    let vault_address: Address = address!("0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9");

    let vault = 
        TokenVault::new(
            vault_address,
            provider.clone()
            );

    //instanciando o endereço do contrato Dilmas
     let token_address: Address = address!("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");
    
     let token = 
        Dilmas::new(
            token_address,
            provider.clone()
            );

    //Consultando o saldo total do contrato TokenVault chamando a função totalAssets() do contrato inteligente
    let mut  total_assets = 
        vault.totalAssets().call().await?;
 
    println!("Total assets in the vault: {}", total_assets);
    
    //Consultando o saldo de AÇÕES de um usuário específico chamando a função balanceOf() do contrato inteligente
    

    let mut user_shares = vault.balanceOf(user).call().await?;

    println!("User shares: {}", user_shares);

    //Fazendo um depósito de token para o contrato e consultando o saldo e balanço de ações do usuário
    let amount = U256::from(500u64) * U256::from(10u64).pow(U256::from(18u64));

    let mint_tx = token.mint(user, amount).send().await?;
    mint_tx.get_receipt().await?;

    let approval = token.approve(vault_address, U256::from(500u64)).send().await?;
    let _approval_receipt = approval.get_receipt().await?;
        println!("Approval successful");

    let _tx = vault.deposit(U256::from(500u64), user).send().await?;

  total_assets = 
        vault.totalAssets().call().await?;
user_shares = vault.balanceOf(user).call().await?;

    println!("Total assets in the vault: {}", total_assets);
    println!("User shares: {}", user_shares);

    Ok(())

}
