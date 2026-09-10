//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC4626} from  "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol"; 



contract TokenVault is ERC4626 {
	IPool public immutable aavePool;


	constructor(IERC20 _asset, 
							IPool _aavePool	
						 ) ERC4626(_asset) ERC20("Token de rendimento aave", "aUSDC"){
								aavePool = _aavePool;
							}
 

	function totalAssets() public view override returns (uint256) {
		return IERC20(asset()).balanceOf(address(this));
	}





}
