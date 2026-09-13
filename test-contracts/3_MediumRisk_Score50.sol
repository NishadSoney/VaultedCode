// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MediumRisk {
    mapping(address => uint256) public balances;
    mapping(address => uint256) public rewards;

    function withdrawBalance() public {
        uint256 bal = balances[msg.sender];
        (bool success, ) = msg.sender.call{value: bal}("");
        require(success);
        balances[msg.sender] = 0;
    }

    function withdrawReward() public {
        uint256 rew = rewards[msg.sender];
        (bool success, ) = msg.sender.call{value: rew}("");
        require(success);
        rewards[msg.sender] = 0;
    }
}
