// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LowRisk {
    mapping(address => uint256) public balances;

    function withdraw() public {
        uint256 bal = balances[msg.sender];
        (bool success, ) = msg.sender.call{value: bal}("");
        require(success);
        balances[msg.sender] = 0;
    }
}
