// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CriticalRisk {
    address public owner;

    function setOwner(address newOwner) public {
        require(tx.origin == owner);
        owner = newOwner;
    }

    function kill() public {
        selfdestruct(payable(msg.sender));
    }

    function destroy() public {
        selfdestruct(payable(msg.sender));
    }
}
