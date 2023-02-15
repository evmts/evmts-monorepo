// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {Script} from "forge-std/Script.sol";

contract PureQuery is Script {
    function add(uint256 num1, uint256 num2) pure external returns (uint256) {
        return num1 + num2;
    }
}