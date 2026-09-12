//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC4626} from  "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";

import {IPoolDataProvider} from "@aave/core-v3/contracts/interfaces/IPoolDataProvider.sol";




contract TokenVault is ERC4626 {
	
	IPool public immutable aavePool;
	IPoolAddressesProvider public immutable provider;
	IPoolDataProvider public immutable dataProvider;
	IERC20 public immutable aToken;
	
	address public immutable keeper;
	modifier onlyKeeper(){
		require(msg.sender == keeper, "Not Keeper");
		_;
	}

	constructor(IERC20 _asset, 
							IPool _aavePool	
						 ) ERC4626(_asset) ERC20("USDC Yield Vault", "shareUSDC"){
        aavePool = _aavePool;

        provider = _aavePool.ADDRESSES_PROVIDER();

        dataProvider = IPoolDataProvider(
            provider.getPoolDataProvider()
        );

        (address tokenAddress,,) =
            dataProvider.getReserveTokensAddresses(address(_asset));

        aToken = IERC20(tokenAddress);

        keeper = msg.sender;
							}






	function totalAssets() public view override returns (uint256) {
		 	
			uint256 aaveTokens = IERC20(aToken).balanceOf(address(this));

		uint256 vaultTokens =  IERC20(asset()).balanceOf(address(this));
		return vaultTokens + aaveTokens ;
	}

	function rebalance() external onlyKeeper{

		uint256 vaultTokens =  IERC20(asset()).balanceOf(address(this));
		if (vaultTokens == 0){
			return;
		}
		
		uint256 invtTokens = (7 * vaultTokens) / 10;

		IERC20(asset()).approve(
			address(aavePool), invtTokens);
		
		aavePool.supply( 
										asset(),
										invtTokens,
										address(this),
										0);


	}

	function _withdraw(address caller, address receiver, address owner, uint256 amount, uint256 shares ) internal override {

		uint256 vaultTokens =  IERC20(asset()).balanceOf(address(this));
		if ( vaultTokens < amount) {
			uint256 missingAssets = amount - vaultTokens;

			aavePool.withdraw(
				address(asset()),
				missingAssets,
				address(this)
			);
		}
		
		super._withdraw(caller, receiver, owner, amount, shares);

	}





} 
