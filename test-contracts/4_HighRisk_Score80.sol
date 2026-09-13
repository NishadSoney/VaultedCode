// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HighRisk {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function kill() public {
        selfdestruct(payable(msg.sender));
    }

    function emergencyWithdraw() public {
        payable(msg.sender).transfer(address(this).balance);
    }
}
