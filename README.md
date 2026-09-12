# DeFi Vault + bot Keeper 

## Descrição do Projeto
Este projeto consiste em um ecossistema descentralizado composto por um cofre de contratos inteligentes (Vault) e um bot off-chain (Keeper). O objetivo do sistema é monitorar fundos ociosos em USDC depositados pelos usuários e realocá-los autonomamente no protocolo Aave V3 para geração de rendimentos (yield), executando o rebalanceamento apenas quando a operação for matematicamente lucrativa.

Este repositório demonstra a integração completa entre infraestrutura blockchain (EVM), desenvolvimento de contratos inteligentes e programação de sistemas assíncronos.

## Arquitetura do Sistema
O projeto é dividido em dois componentes principais:

1. **Smart Contract (Solidity):**
   * Contrato `TokenVault` responsável por receber depósitos em USDC e emitir cotas (shares) para os usuários.
   * Contém a lógica de depósito e resgate integradas ao pool de liquidez da Aave V3.
   * Utiliza bibliotecas do OpenZeppelin para padronização e segurança.

2. **Keeper Bot (Rust):**
   * Daemon assíncrono que monitora continuamente o estado do cofre na blockchain.
   * Consulta oráculos on-chain para obter preços de ativos (ETH/USD, USDC/USD) e taxas de juros (liquidity rate) em tempo real.
   * Possui um motor matemático off-chain que projeta o rendimento futuro e calcula o custo de execução (Gas) antes de assinar e enviar transações.

## Tecnologias e Ferramentas Utilizadas
* **Linguagens:** Rust, Solidity, TypeScript/JavaScript.
* **Integração Web3 (Rust):** Alloy (provedores, signers, geração de interfaces ABI), Tokio (runtime assíncrono), Eyre (tratamento de erros).
* **Blockchain & Contratos:** Hardhat, Ethers.js, OpenZeppelin Contracts.
* **Protocolos DeFi:** Aave V3 (IPool, IAaveOracle).
* **Testes:** Mocha, Chai, Hardhat Network (Mainnet/Testnet Forking).

## Como Executar
### 1. Instale as dependências do ecossistema Ethereum:
   ```bash
   npm install
   ```

### 2. Iniciar o nó local com o fork da rede
```bash
npx hardhat node
```

### 3. Realizar o deploy do contrato
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

### 4. Iniciar o Keeper Bot (Rust)
Configure as variáveis de ambiente necessárias (como `PRIVATE_KEY`) e execute:
```bash
cargo run
```

### 5. Executar os testes E2E
Em um terminal secundário, execute a suíte de testes para simular os depósitos e a atuação autônoma do bot:
```bash
npx hardhat test test/E2E_Vault.test.js --network localhost
```
