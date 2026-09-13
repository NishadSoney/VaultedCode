// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ExtremeRisk {
    address public owner;

    function kill() public {
        selfdestruct(payable(msg.sender));
    }

    function destroy() public {
        selfdestruct(payable(msg.sender));
    }

    function emergencyWithdraw() public {
        payable(msg.sender).transfer(address(this).balance);
    }

    function proxyCall(address target, bytes memory data) public {
        (bool success, ) = target.delegatecall(data);
        require(success);
    }
}
