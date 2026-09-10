// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Dilmas is ERC20 {
		constructor() ERC20("Dilmas", "DIL"){}

		function mint(address recipient, uint256 amount) external {
			_mint(recipient, amount);
		}

		function decimals() public view virtual override returns (uint8) {
			return 18;
		}
}
